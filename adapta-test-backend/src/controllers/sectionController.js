// src/controllers/sectionController.js
const Section = require("../models/sectionModel");
const Course = require("../models/courseModel");
const AcademicCycle = require("../models/academicCycleModel");
const User = require("../models/userModel");

// @desc    Crear una nueva sección para un curso
// @route   POST /api/courses/:courseId/sections
// @access  Private/Admin or Private/Coordinator
const createSection = async (req, res) => {
  const { instructor, academicCycle, sectionCode, capacity } = req.body;
  const { courseId } = req.params;

  // 1. Verificar que todas las entidades referenciadas existan DENTRO de la misma institución
  const course = await Course.findOne({
    _id: courseId,
    institution: req.institution._id,
  });
  if (!course) {
    return res
      .status(404)
      .json({ message: "Curso no encontrado en esta institución." });
  }

  const cycle = await AcademicCycle.findOne({
    _id: academicCycle,
    institution: req.institution._id,
  });
  if (!cycle) {
    return res
      .status(404)
      .json({ message: "Ciclo académico no encontrado en esta institución." });
  }

  const professor = await User.findOne({
    _id: instructor,
    institution: req.institution._id,
    role: "professor",
  });
  if (!professor) {
    return res
      .status(404)
      .json({
        message: "Profesor no encontrado o no válido en esta institución.",
      });
  }

  // 2. Crear la sección asignando la institución
  const section = await Section.create({
    course: courseId,
    instructor,
    academicCycle,
    sectionCode,
    capacity,
    institution: req.institution._id,
  });

  res.status(201).json(section);
};

// @desc    Obtener todas las secciones de un curso para el ciclo activo
// @route   GET /api/courses/:courseId/sections
// @access  Private
const getSectionsForCourse = async (req, res) => {
  const { courseId } = req.params;

  const activeCycle = await AcademicCycle.findOne({
    isActive: true,
    institution: req.institution._id,
  });
  if (!activeCycle) {
    return res.json([]); // No hay ciclo activo, no hay secciones que mostrar
  }

  const sections = await Section.find({
    course: courseId,
    academicCycle: activeCycle._id,
    institution: req.institution._id,
  }).populate("instructor", "name");

  res.json(sections);
};

// @desc    Obtener las secciones asignadas a un instructor
// @route   GET /api/sections/my-sections
// @access  Private/Professor
const getMySections = async (req, res) => {
  const sections = await Section.find({
    instructor: req.user._id,
    institution: req.institution._id,
  })
    .populate("course", "title")
    .populate("academicCycle", "name");

  res.json(sections);
};

// @desc    Obtener una sección por su ID
// @route   GET /api/sections/:id
// @access  Private
const getSectionById = async (req, res) => {
  const section = await Section.findOne({
    _id: req.params.id,
    institution: req.institution._id,
  })
    .populate("course", "title description syllabus")
    .populate("instructor", "name");

  if (section) {
    res.json(section);
  } else {
    res.status(404).json({ message: "Sección no encontrada" });
  }
};

// @desc    Actualizar los criterios de aprobación de una sección
// @route   PUT /api/sections/:id/criteria
// @access  Private/Professor or Private/Coordinator
const updateApprovalCriteria = async (req, res) => {
  const section = await Section.findOne({
    _id: req.params.id,
    institution: req.institution._id,
  });

  if (!section) {
    return res.status(404).json({ message: "Sección no encontrada." });
  }

  if (section.instructor.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "No autorizado para modificar esta sección." });
  }

  section.approvalCriteria = {
    ...section.approvalCriteria,
    ...req.body,
  };

  const updatedSection = await section.save();
  res.json(updatedSection);
};

module.exports = {
  createSection,
  getSectionsForCourse,
  getMySections,
  getSectionById,
  updateApprovalCriteria,
};
