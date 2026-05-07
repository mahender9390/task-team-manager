const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// All routes require authentication
router.use(protect);

// GET — both roles, RBAC enforced inside controller
router.get('/', getAllTasks);
router.get('/:id', getTaskById);

// Admin-only create/delete
router.post('/', restrictTo('Admin'), createTask);
router.delete('/:id', restrictTo('Admin'), deleteTask);

// PUT — both roles, RBAC enforced inside controller
// (Members can update only status of their own tasks)
router.put('/:id', updateTask);

module.exports = router;
