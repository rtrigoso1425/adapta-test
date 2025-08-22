const express = require('express');
const router = express.Router();
const { 
    enrollStudent,
    getMyEnrollments,
    getMyEnrollmentHistory
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/enroll')
    .post(protect, authorize('student'), enrollStudent);

router.route('/my-enrollments')
    .get(protect, authorize('student'), getMyEnrollments);


router.route('/my-history')
    .get(protect, authorize('student'), getMyEnrollmentHistory);

module.exports = router;