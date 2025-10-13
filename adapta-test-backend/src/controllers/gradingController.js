// src/controllers/gradingController.js
const Section = require("../models/sectionModel");
const Enrollment = require("../models/enrollmentModel");
const Mastery = require("../models/masteryModel");
const Submission = require("../models/submissionModel");
const Module = require("../models/moduleModel");
const Assignment = require("../models/assignmentModel");

/**
 * Middleware de ayuda para validar permisos y cargar la sección.
 * Centraliza la lógica de verificación para evitar duplicar código.
 */
const validateGradingPermissions = async (req) => {
  const section = await Section.findOne({
    _id: req.params.sectionId,
    institution: req.institution._id,
  }).populate("course");

  if (!section) {
    // Lanzamos un error que puede ser capturado por un bloque try-catch
    const error = new Error("Sección no encontrada en esta institución.");
    error.status = 404;
    throw error;
  }

  // Un admin de la institución puede calificar, o el profesor asignado
  if (
    req.user.role === "professor" &&
    section.instructor.toString() !== req.user._id.toString()
  ) {
    const error = new Error(
      "No tienes permisos para gestionar las calificaciones de esta sección."
    );
    error.status = 403;
    throw error;
  }
  return section;
};

/**
 * Función interna para evaluar a un estudiante contra los criterios de la sección.
 * Reutilizable para la vista previa y el procesamiento final.
 */
const checkStudentAgainstCriteria = async (
  studentId,
  section,
  criteria,
  institutionId
) => {
  let allCriteriaMet = true;
  const checks = []; // Un array para registrar el resultado de cada verificación

  // --- Verificación del Pilar 1: Maestría ---
  if (criteria.mastery?.required) {
    const modulesInSection = await Module.find({
      "publishedIn.section": section._id,
      institution: institutionId,
    });
    let modulesPassed = 0;
    for (const module of modulesInSection) {
      const masteryRecord = await Mastery.findOne({
        student: studentId,
        module: module._id,
        institution: institutionId,
      });
      if (
        masteryRecord &&
        masteryRecord.highestMasteryScore >= criteria.mastery.minPercentage
      ) {
        modulesPassed++;
      }
    }
    const masteryMet = modulesPassed === modulesInSection.length;
    checks.push({
      name: "Maestría",
      status: `${modulesPassed} de ${modulesInSection.length} módulos superan el ${criteria.mastery.minPercentage}%`,
      isMet: masteryMet,
    });
    if (!masteryMet) allCriteriaMet = false;
  }

  // --- Verificación del Pilar 2: Tareas Entregadas ---
  if (criteria.completion?.allAssignmentsRequired) {
    const assignmentsInSection = await Assignment.find({
      section: section._id,
      institution: institutionId,
    });
    const submissionCount = await Submission.countDocuments({
      student: studentId,
      assignment: { $in: assignmentsInSection.map((a) => a._id) },
      institution: institutionId,
    });
    const assignmentsMet = submissionCount === assignmentsInSection.length;
    checks.push({
      name: "Tareas Entregadas",
      status: `${submissionCount} de ${assignmentsInSection.length} tareas entregadas`,
      isMet: assignmentsMet,
    });
    if (!assignmentsMet) allCriteriaMet = false;
  }

  // Aquí se podrían añadir más verificaciones (exámenes sumativos, etc.) en el futuro

  return { allCriteriaMet, checks };
};

// @desc    Obtener una vista previa del estado de calificación de una sección
// @route   GET /api/grading/preview/:sectionId
// @access  Private/Professor or Admin
const getGradingPreview = async (req, res, next) => {
  try {
    const section = await validateGradingPermissions(req);
    const criteria = section.approvalCriteria;

    if (
      !criteria ||
      (!criteria.mastery?.required &&
        !criteria.completion?.allAssignmentsRequired)
    ) {
      return res.json([]); // No hay criterios configurados, no hay nada que previsualizar
    }

    const enrollments = await Enrollment.find({
      section: section._id,
      status: "enrolled",
    }).populate("student", "name");
    let previewResults = [];

    for (const enrollment of enrollments) {
      const { allCriteriaMet, checks } = await checkStudentAgainstCriteria(
        enrollment.student._id,
        section,
        criteria,
        req.institution._id
      );

      previewResults.push({
        student: enrollment.student,
        enrollmentId: enrollment._id,
        checks: checks,
        finalStatus: allCriteriaMet ? "APROBADO" : "DESAPROBADO",
      });
    }
    res.json(previewResults);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// @desc    Procesar las calificaciones finales para toda una sección
// @route   POST /api/grading/process-section/:sectionId
// @access  Private/Admin or Professor
const processSectionGrades = async (req, res, next) => {
  try {
    const section = await validateGradingPermissions(req);
    const criteria = section.approvalCriteria;

    if (
      !criteria ||
      (!criteria.mastery?.required &&
        !criteria.completion?.allAssignmentsRequired)
    ) {
      return res
        .status(400)
        .json({
          message:
            "No se han configurado criterios de aprobación para procesar esta sección.",
        });
    }

    const enrollments = await Enrollment.find({
      section: section._id,
      status: "enrolled",
    });
    let results = [];

    for (const enrollment of enrollments) {
      const { allCriteriaMet } = await checkStudentAgainstCriteria(
        enrollment.student,
        section,
        criteria,
        req.institution._id
      );

      enrollment.status = allCriteriaMet ? "passed" : "failed";
      await enrollment.save();

      results.push({
        studentId: enrollment.student,
        status: enrollment.status,
      });
    }

    res.status(200).json({
      message: `Procesamiento de la sección "${section.course.title}" completado. ${results.length} estudiantes fueron procesados.`,
      results,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { processSectionGrades, getGradingPreview };
