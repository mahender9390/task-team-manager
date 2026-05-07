const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.get('/me', protect, getMe);


// This route will handle the GET request for all users
const User = require('../models/User'); // Double check this path to your User model

router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'role'] // Only send the basics, NO passwords!
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;
