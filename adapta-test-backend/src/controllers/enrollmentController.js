// src/controllers/enrollmentController.js
const Enrollment = require("../models/enrollmentModel");
const Section = require("../models/sectionModel");
const Course = require("../models/courseModel");
const InstitutionRulesService = require('../services/institutionRulesService');

// @desc    Estudiante se matricula en una sección
// @route   POST /api/enrollments/enroll
// @access  Private/Student
const enrollStudent = async (req, res) => {
  const { sectionId } = req.body;
  const studentId = req.user._id;

  // --- 1. Validar que la sección exista en la institución ---
  const section = await Section.findOne({ _id: sectionId, institution: req.institution._id }).populate("course");
  if (!section) {
    return res.status(404).json({ message: "Sección no encontrada en esta institución." });
  }

  // --- 2. Ejecutar Validaciones ---
  // A: ¿Ya está matriculado?
  const existingEnrollment = await Enrollment.findOne({ student: studentId, section: sectionId });
  if (existingEnrollment) {
    return res.status(400).json({ message: "Ya te encuentras matriculado en esta sección." });
  }

  // B: ¿Hay capacidad disponible?
  const enrolledCount = await Enrollment.countDocuments({ section: sectionId });
  if (enrolledCount >= section.capacity) {
    return res.status(400).json({ message: "La sección ha alcanzado su capacidad máxima." });
  }

  // C: ¿Cumple con los requisitos de la institución (prerrequisitos, grado, etc.)?
  const canEnroll = await InstitutionRulesService.canEnrollInCourse(req.user, section.course, req.institution);
  if (!canEnroll) {
    return res.status(403).json({ message: "No cumples los requisitos para matricularte en este curso." });
  }

  // --- 3. Crear Matrícula ---
  const enrollment = await Enrollment.create({
    student: studentId,
    section: sectionId,
    institution: req.institution._id, // Asignar institución
  });

  res.status(201).json({ message: "¡Matrícula exitosa!", enrollment });
};

// @desc    Estudiante obtiene sus matrículas
// @route   GET /api/enrollments/my-enrollments
// @access  Private/Student
const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
    institution: req.institution._id // Filtrar por institución
  }).populate({
    path: "section",
    populate: [
      { path: "course", select: "title" },
      { path: "instructor", select: "name" },
    ],
  });
  res.json(enrollments);
};

// @desc    Estudiante obtiene su historial académico agrupado por ciclo
// @route   GET /api/enrollments/my-history
// @access  Private/Student
const getMyEnrollmentHistory = async (req, res) => {
  const allEnrollments = await Enrollment.find({
    student: req.user._id,
    institution: req.institution._id // Filtrar por institución
  })
  .populate({
    path: "section",
    populate: [
      { path: "course", select: "title" },
      { path: "instructor", select: "name" },
      { path: "academicCycle", select: "name isActive" },
    ],
  })
  .sort({ "section.academicCycle.startDate": -1 });

  const groupedByCycle = allEnrollments.reduce((acc, enrollment) => {
    const cycle = enrollment.section.academicCycle;
    if (!cycle) return acc;

    const cycleId = cycle._id.toString();
    if (!acc[cycleId]) {
      acc[cycleId] = {
        cycleId: cycleId,
        cycleName: cycle.name,
        isActive: cycle.isActive,
        enrollments: [],
      };
    }
    acc[cycleId].enrollments.push(enrollment);
    return acc;
  }, {});

  const history = Object.values(groupedByCycle);
  res.json(history);
};

// @desc    Estudiante se matricula en un lote de secciones (carrito)
// @route   POST /api/enrollments/enroll-batch
// @access  Private/Student
const enrollInBatch = async (req, res) => {
  const { sectionIds } = req.body;
  const studentId = req.user._id;

  if (!sectionIds || sectionIds.length === 0) {
    return res.status(400).json({ message: "No se han proporcionado secciones para la matrícula." });
  }

  // Obtener todas las secciones de una vez para optimizar
  const sections = await Section.find({
    _id: { $in: sectionIds },
    institution: req.institution._id
  }).populate("course");

  // --- FASE DE VALIDACIÓN PREVIA ---
  const validationErrors = [];
  for (const sectionId of sectionIds) {
    const section = sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      validationErrors.push(`La sección con ID ${sectionId} no fue encontrada en esta institución.`);
      continue;
    }

    // Validación A: Capacidad
    const enrolledCount = await Enrollment.countDocuments({ section: sectionId });
    if (enrolledCount >= section.capacity) {
      validationErrors.push(`El curso "${section.course.title}" no tiene vacantes.`);
    }

    // Validación B: Prerrequisitos y reglas institucionales
    const canEnroll = await InstitutionRulesService.canEnrollInCourse(req.user, section.course, req.institution);
    if (!canEnroll) {
      validationErrors.push(`No cumples los prerrequisitos para el curso "${section.course.title}".`);
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: `No se pudo completar la matrícula debido a los siguientes errores: \n- ${validationErrors.join("\n- ")}`
    });
  }

  // --- FASE DE CREACIÓN ---
  const enrollmentPromises = sectionIds.map(sectionId => {
    return Enrollment.create({
      student: studentId,
      section: sectionId,
      institution: req.institution._id // Asignar institución
    });
  });

  const enrollments = await Promise.all(enrollmentPromises);

  res.status(201).json({ message: "¡Matrícula completada exitosamente!", enrollments });
};

module.exports = {
  enrollStudent,
  getMyEnrollments,
  getMyEnrollmentHistory,
  enrollInBatch,
};
