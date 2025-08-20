// src/routes/section.content.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/authMiddleware');

// Controladores
const { publishModuleToSection, getPublishedModulesForSection } = require('../controllers/moduleController');
const { createAssignment, getAssignmentsForSection } = require('../controllers/assignmentController');

// Rutas para Módulos dentro de una Sección
router.route('/modules')
    .post(protect, authorize('professor'), publishModuleToSection)
    .get(protect, getPublishedModulesForSection);

// Rutas para Tareas dentro de una Sección
router.route('/assignments')
    .post(protect, authorize('professor'), createAssignment)
    .get(protect, getAssignmentsForSection);

module.exports = router;