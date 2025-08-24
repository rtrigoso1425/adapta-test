const express = require('express');
const router = express.Router({ mergeParams: true });
const { createLessonInModule, getLessonsFromModule } = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { completeLesson } = require('../controllers/lessonCompletionController'); // <-- IMPORTAR


// Las rutas aquí son relativas a /api/modules/:moduleId/lessons
router.route('/')
    .post(protect, authorize('professor'), createLessonInModule)
    .get(protect, getLessonsFromModule);

// POST /api/modules/:moduleId/lessons/:id/complete
router.route('/:id/complete').post(protect, authorize('student'), completeLesson);


    module.exports = router;