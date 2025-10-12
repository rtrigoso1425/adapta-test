// src/controllers/assignmentController.js
const Assignment = require("../models/assignmentModel");
const Section = require("../models/sectionModel");

// @desc    Crear una nueva tarea en una sección
// @route   POST /api/sections/:sectionId/assignments
// @access  Private/Professor
const createAssignment = async (req, res) => {
  const { sectionId } = req.params;
  const { title, instructions, dueDate, pointsPossible } = req.body;

  // 1. Validar que la sección exista DENTRO de la institución del profesor
  const section = await Section.findOne({
    _id: sectionId,
    institution: req.institution._id,
  });
  if (!section) {
    return res
      .status(404)
      .json({ message: "Sección no encontrada en esta institución." });
  }

  // 2. Validar que el profesor que hace la petición sea el instructor de la sección
  if (section.instructor.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({
        message: "No está autorizado para crear tareas en esta sección.",
      });
  }

  // 3. Crear la tarea, asignándole la institución
  const assignment = await Assignment.create({
    section: sectionId,
    title,
    instructions,
    dueDate,
    pointsPossible,
    institution: req.institution._id, // Asignar la institución
  });

  res.status(201).json(assignment);
};

// @desc    Obtener todas las tareas de una sección
// @route   GET /api/sections/:sectionId/assignments
// @access  Private
const getAssignmentsForSection = async (req, res) => {
  const { sectionId } = req.params;

  // 1. Validar que la sección exista en la institución del usuario antes de mostrar sus tareas
  const sectionExists = await Section.exists({
    _id: sectionId,
    institution: req.institution._id,
  });
  if (!sectionExists) {
    return res
      .status(404)
      .json({ message: "Sección no encontrada en esta institución." });
  }

  // 2. Si la sección es válida, buscar las tareas que le pertenecen
  // El filtro de institución aquí es una capa extra de seguridad, aunque ya está implícito por la validación anterior.
  const assignments = await Assignment.find({
    section: sectionId,
    institution: req.institution._id,
  }).sort("dueDate");

  res.json(assignments);
};

module.exports = { createAssignment, getAssignmentsForSection };
