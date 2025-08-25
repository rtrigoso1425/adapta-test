const express = require('express');
const router = express.Router();
const sectionRoutes = require('./sectionRoutes');
const upload = require('../config/upload');

// Importamos TODOS los controladores que necesitamos aquí
const { createCourse, getCourses, getCourseById, uploadSyllabus} = require('../controllers/courseController');
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

// Ruta para subir el sílabus (solo para coordinadores)
// Usa el middleware 'upload.single('syllabus')' para procesar el archivo
router.route('/:courseId/upload-syllabus')
    .post(protect, authorize('coordinator'), upload.single('syllabus'), uploadSyllabus);

module.exports = router;
