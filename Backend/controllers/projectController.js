const { Project, User, Task } = require('../models');
const { Op } = require('sequelize');

// Shared include config
const projectIncludes = [
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
];

// ── GET /api/projects ─────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'Admin') {
      // Admins see all projects
      projects = await Project.findAll({ include: projectIncludes, order: [['createdAt', 'DESC']] });
    } else {
      // Members see only projects they belong to
      projects = await req.user.getMemberProjects({ include: projectIncludes });
    }

    res.json({ count: projects.length, projects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects.', error: err.message });
  }
};

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        ...projectIncludes,
        {
          model: Task,
          as: 'tasks',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Members can only view projects they are part of
    if (req.user.role === 'Member') {
      const isMember = project.members.some((m) => m.id === req.user.id);
      if (!isMember) return res.status(403).json({ message: 'Access denied to this project.' });
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project.', error: err.message });
  }
};

// ── POST /api/projects  [Admin only] ──────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;

    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const project = await Project.create({ name, description, createdBy: req.user.id });

    // Add creator + any specified members
    const allMemberIds = [...new Set([req.user.id, ...memberIds])];
    const members = await User.findAll({ where: { id: { [Op.in]: allMemberIds } } });
    await project.setMembers(members);

    const result = await Project.findByPk(project.id, { include: projectIncludes });
    res.status(201).json({ message: 'Project created.', project: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project.', error: err.message });
  }
};

// ── PUT /api/projects/:id  [Admin only] ───────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const { name, description, memberIds } = req.body;

    await project.update({ name: name ?? project.name, description: description ?? project.description });

    if (memberIds !== undefined) {
      const members = await User.findAll({ where: { id: { [Op.in]: memberIds } } });
      await project.setMembers(members);
    }

    const result = await Project.findByPk(project.id, { include: projectIncludes });
    res.json({ message: 'Project updated.', project: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project.', error: err.message });
  }
};

// ── DELETE /api/projects/:id  [Admin only] ────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await project.destroy(); // Tasks cascade via DB / Sequelize
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project.', error: err.message });
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
