const express = require('express');
const router = express.Router();
const { enrollInCareer } = require('../controllers/academicRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/enroll').post(protect, authorize('student'), enrollInCareer);

module.exports = router;