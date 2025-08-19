const express = require('express');
const router = express.Router({ mergeParams: true });
const { createSection, getSectionsForCourse, getMySections } = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'coordinator'), createSection)
    .get(protect, getSectionsForCourse);

router.get('/my-sections', protect, authorize('professor'), getMySections);

module.exports = router;