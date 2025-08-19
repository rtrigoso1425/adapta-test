const express = require('express');
const router = express.Router();
const { createCycle, getCycles } = require('../controllers/academicCycleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin'), createCycle)
    .get(protect, getCycles);

module.exports = router;