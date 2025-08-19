const express = require('express');
const router = express.Router({ mergeParams: true });
const { createLessonInModule, getLessonsFromModule } = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Las rutas aquí son relativas a /api/modules/:moduleId/lessons
router.route('/')
    .post(protect, authorize('professor'), createLessonInModule)
    .get(protect, getLessonsFromModule);

module.exports = router;