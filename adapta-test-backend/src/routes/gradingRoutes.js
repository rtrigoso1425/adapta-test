const express = require('express');
const router = express.Router();
const { processSectionGrades, getGradingPreview } = require('../controllers/gradingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ruta para obtener la vista previa
router.route('/preview/:sectionId').get(protect, authorize('admin', 'professor'), getGradingPreview);

// Ruta segura para que un admin ejecute el proceso de calificación de una sección
router.route('/process-section/:sectionId').post(protect, authorize('admin', 'professor'), processSectionGrades);

module.exports = router;