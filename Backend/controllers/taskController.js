const { Task, User, Project } = require('../models');

const taskIncludes = [
  { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
  { model: Project, as: 'project', attributes: ['id', 'name'] },
];

// Helper — check if Member belongs to the task's project
const isMemberOfProject = async (user, projectId) => {
  const projects = await user.getMemberProjects({ where: { id: projectId } });
  return projects.length > 0;
};

// ── GET /api/tasks  ───────────────────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    
    // 1. If an Admin is searching for a specific assignee, use that.
    // 2. If a Member is logged in, FORCED filter to their own ID.
    if (req.user.role === 'Member') {
      where.assignedTo = req.user.id; 
    } else if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const tasks = await Task.findAll({ 
      where, 
      include: taskIncludes, 
      order: [['dueDate', 'ASC']] 
    });

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
  }
};
// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: taskIncludes });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role === 'Member') {
      const allowed = await isMemberOfProject(req.user, task.projectId);
      if (!allowed) return res.status(403).json({ message: 'Access denied to this task.' });
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task.', error: err.message });
  }
};

// ── POST /api/tasks  [Admin only] ─────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, projectId, assignedTo } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required.' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (assignedTo) {
      const assignee = await User.findByPk(assignedTo);
      if (!assignee) return res.status(404).json({ message: 'Assigned user not found.' });
    }

    const task = await Task.create({ title, description, status, dueDate, projectId, assignedTo });
    const result = await Task.findByPk(task.id, { include: taskIncludes });

    res.status(201).json({ message: 'Task created.', task: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task.', error: err.message });
  }
};

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
// Admin: update any field | Member: update ONLY status of their own assigned tasks
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role === 'Member') {
      // Must be the assignee
      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
      }

      const { status } = req.body;
      const allowed = ['Todo', 'In Progress', 'Done'];
      if (!status || !allowed.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}.` });
      }

      await task.update({ status });
    } else {
      // Admin: full update
      const { title, description, status, dueDate, projectId, assignedTo } = req.body;
      await task.update({
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
        dueDate: dueDate ?? task.dueDate,
        projectId: projectId ?? task.projectId,
        assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      });
    }

    const result = await Task.findByPk(task.id, { include: taskIncludes });
    res.json({ message: 'Task updated.', task: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task.', error: err.message });
  }
};

// ── DELETE /api/tasks/:id  [Admin only] ───────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    await task.destroy();
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task.', error: err.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
