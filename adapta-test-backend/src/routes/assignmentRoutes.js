const express = require('express');
const router = express.Router({ mergeParams: true });
const { createAssignment, getAssignmentsForSection } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('professor'), createAssignment)
    .get(protect, getAssignmentsForSection);

module.exports = router;