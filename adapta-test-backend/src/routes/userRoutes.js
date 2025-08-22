const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getUserProfile, getUsers } = require('../controllers/userController');


router.route('/')
    .post(registerUser)
    .get(protect, authorize('admin'), getUsers);

router.post('/login', loginUser);

router.get('/profile', protect, getUserProfile);

module.exports = router;