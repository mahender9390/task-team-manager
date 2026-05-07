const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// All routes require authentication
router.use(protect);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Admin-only mutations
router.post('/', restrictTo('Admin'), createProject);
router.put('/:id', restrictTo('Admin'), updateProject);
router.delete('/:id', restrictTo('Admin'), deleteProject);

module.exports = router;
