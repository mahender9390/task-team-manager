const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');

// ── Associations ──────────────────────────────────────────────────────────────

// A User can create many Projects
User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// A Project has many Tasks
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// A User can be assigned many Tasks
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Project ↔ User membership (many-to-many via ProjectMembers join table)
User.belongsToMany(Project, {
  through: 'ProjectMembers',
  as: 'memberProjects',
  foreignKey: 'userId',
});
Project.belongsToMany(User, {
  through: 'ProjectMembers',
  as: 'members',
  foreignKey: 'projectId',
});

module.exports = { sequelize, User, Project, Task };
