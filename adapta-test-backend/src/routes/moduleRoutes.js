const express = require('express');
const router = express.Router();
const { createModuleInLibrary, getMyLibraryModules } = require('../controllers/moduleController');
const { createQuestion, getQuestionsForModule } = require('../controllers/questionController'); // Importar controladores específicos

const { protect, authorize } = require('../middleware/authMiddleware');
const  { startEvaluation } = require ('../controllers/evaluationController.js');

// Importar el router de lecciones
const lessonRoutes = require('./lessonRoutes');

// Rutas para la biblioteca personal del profesor
router.route('/')
    .post(protect, authorize('professor'), createModuleInLibrary);

// Corresponde a /api/modules/my-library
router.route('/my-library')
    .get(protect, authorize('professor'), getMyLibraryModules);

// Re-direccionar hacia el router de lecciones para un módulo específico
router.use('/:moduleId/lessons', lessonRoutes);

router.route('/:moduleId/questions')
    .post(protect, authorize('professor'), createQuestion)
    .get(protect, authorize('professor'), getQuestionsForModule);

router.post('/:moduleId/evaluations/start', protect, authorize('student'), startEvaluation);

module.exports = router;