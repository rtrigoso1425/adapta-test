const express = require('express');
const router = express.Router();
const { getMyAcademicProgress } = require('../controllers/academicProgressController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/my-progress')
    .get(protect, authorize('student'), getMyAcademicProgress);

module.exports = router;