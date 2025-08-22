const express = require('express');
const router = express.Router({ mergeParams: true });
const { createSection, getSectionsForCourse, getMySections, getSectionById, updateApprovalCriteria } = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const assignmentRoutes = require('./assignmentRoutes');

router.route('/')
    .post(protect, authorize('admin', 'coordinator'), createSection)
    .get(protect, getSectionsForCourse);

router.get('/my-sections', protect, authorize('professor'), getMySections);

router.use('/:sectionId/assignments', assignmentRoutes);

router.get('/:id', protect, getSectionById);

router.route('/:id/criteria').put(protect, authorize('professor', 'coordinator'), updateApprovalCriteria);

module.exports = router;