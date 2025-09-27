// src/routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const sectionRoutes = require("./sectionRoutes");
const upload = require("../config/upload");

const {
  createCourse,
  getCourses,
  getCourseById,
  uploadSyllabus,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// @desc Crear un nuevo curso
// @route POST /api/courses
// @access Private (Solo Admin y Coordinador de institución)
router
  .route("/")
  .post(protect, authorize("admin", "coordinator"), createCourse) // Roles de institución
  .get(protect, getCourses);

// @desc Obtener un curso por ID
// @route GET /api/courses/:id
// @access Private (Usuarios logueados)
router.route("/:id").get(protect, getCourseById);


// @desc Subir el sílabus de un curso
// @route POST /api/courses/:courseId/upload-syllabus
// @access Private (Solo Coordinador de institución)
router
  .route("/:courseId/upload-syllabus")
  .post(
    protect,
    authorize("coordinator"),
    upload.single("syllabus"),
    uploadSyllabus
  );

// --- Rutas Anidadas ---
// Cualquier petición a /api/courses/:courseId/sections será manejada por sectionRoutes
// @desc Rutas para secciones de un curso
// @route /api/courses/:courseId/sections
// @access Private (Solo Coordinador de institución)
router.use("/:courseId/sections", sectionRoutes);

module.exports = router;
