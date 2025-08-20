const express = require('express');
const router = express.Router();
const sectionRoutes = require('./sectionRoutes');

// Importamos TODOS los controladores que necesitamos aquí
const { createCourse, getCourses, getCourseById} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Rutas para los Cursos en sí ---
// Corresponde a /api/courses
router.route('/')
    .post(protect, authorize('admin', 'coordinator', 'professor'), createCourse)
    .get(protect, getCourses);

// --- Rutas ANIDADAS para los Módulos DENTRO de un Curso ---
// Corresponde a /api/courses/:courseId/modules

// Aquí anidaremos las lecciones en el futuro, pero lo haremos de la misma forma.

router.use('/:courseId/sections', sectionRoutes);

router.route('/:id').get(protect, getCourseById);

module.exports = router;