const express = require('express');
const router = express.Router();
const { updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas para /api/questions/:questionId
router.route('/:questionId')
    .put(protect, authorize('professor'), updateQuestion)
    .delete(protect, authorize('professor'), deleteQuestion);

module.exports = router;