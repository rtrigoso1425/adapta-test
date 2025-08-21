const express = require('express');
const router = express.Router();
const { submitAnswer } = require ('../controllers/evaluationController.js');
const { protect, authorize } = require  ('../middleware/authMiddleware.js');

router.post('/:sessionId/submit', protect, authorize('student'), submitAnswer);

module.exports = router;