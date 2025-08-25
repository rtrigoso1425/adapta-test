const express = require('express');
const router = express.Router();
const { getSectionAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ruta segura para que el profesor/admin obtenga las analíticas de una sección
router.route('/section/:sectionId').get(protect, authorize('admin', 'professor'), getSectionAnalytics);

module.exports = router;