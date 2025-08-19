const express = require('express');
const router = express.Router();
const { enrollStudent, getMyEnrollments } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'coordinator'), enrollStudent);

router.route('/my-enrollments')
    .get(protect, authorize('student'), getMyEnrollments);

module.exports = router;