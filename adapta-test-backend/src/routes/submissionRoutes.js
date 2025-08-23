const express = require('express');
const router = express.Router();
const { gradeSubmission } = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ruta para calificar una entrega específica
// PUT /api/submissions/:submissionId/grade
router.route('/:submissionId/grade').put(protect, authorize('professor'), gradeSubmission);

module.exports = router;