// src/controllers/analyticsController.js
const Section = require("../models/sectionModel");
const Enrollment = require("../models/enrollmentModel");
const Mastery = require("../models/masteryModel");
const PerformanceLog = require("../models/performanceLogModel");
const Module = require("../models/moduleModel");

// @desc    Obtener las analíticas de rendimiento para una sección
// @route   GET /api/analytics/section/:sectionId
// @access  Private/Professor or Admin
const getSectionAnalytics = async (req, res) => {
  const { sectionId } = req.params;
  const institutionId = req.institution._id;

  // 1. Validar que la sección exista en la institución y que el usuario tenga permisos
  const section = await Section.findOne({
    _id: sectionId,
    institution: institutionId,
  });
  if (!section) {
    return res
      .status(404)
      .json({ message: "Sección no encontrada en esta institución." });
  }
  if (
    req.user.role === "professor" &&
    section.instructor.toString() !== req.user._id.toString()
  ) {
    return res
      .status(403)
      .json({
        message: "No tienes permisos para ver las analíticas de esta sección.",
      });
  }

  // 2. Obtener los IDs de los estudiantes matriculados en esta sección
  const enrollments = await Enrollment.find({
    section: sectionId,
    status: "enrolled",
    institution: institutionId,
  });
  const studentIds = enrollments.map((e) => e.student);

  if (studentIds.length === 0) {
    return res.json({
      message: "No hay estudiantes matriculados para generar analíticas.",
    });
  }

  // 3. Obtener los módulos de la sección
  const modulesInSection = await Module.find({
    "publishedIn.section": sectionId,
    institution: institutionId,
  });
  const moduleIds = modulesInSection.map((m) => m._id);

  // --- Calcular Maestría Promedio por Módulo ---
  const masteryRecords = await Mastery.find({
    student: { $in: studentIds },
    module: { $in: moduleIds },
    institution: institutionId,
  });
  const masteryByModule = modulesInSection.map((module) => {
    const relevantRecords = masteryRecords.filter(
      (r) => r.module.toString() === module._id.toString()
    );
    const totalMastery = relevantRecords.reduce(
      (acc, record) => acc + record.highestMasteryScore,
      0
    );
    const averageMastery =
      relevantRecords.length > 0 ? totalMastery / relevantRecords.length : 0;
    return {
      moduleId: module._id,
      moduleTitle: module.title,
      averageMastery: averageMastery.toFixed(2),
    };
  });

  // --- Encontrar las Preguntas Más Difíciles ---
  const performanceLogs = await PerformanceLog.find({
    student: { $in: studentIds },
    module: { $in: moduleIds },
    institution: institutionId,
  });
  const questionFailures = {};
  performanceLogs.forEach((log) => {
    if (!log.isCorrect) {
      const qId = log.question.toString();
      questionFailures[qId] = (questionFailures[qId] || 0) + 1;
    }
  });
  const difficultQuestions = Object.entries(questionFailures)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5

  // --- Identificar Estudiantes con Dificultades (maestría < 40 en cualquier módulo) ---
  const strugglingStudentsRecords = await Mastery.find({
    student: { $in: studentIds },
    module: { $in: moduleIds },
    highestMasteryScore: { $lt: 40 },
    institution: institutionId,
  })
    .populate("student", "name")
    .populate("module", "title");

  res.json({
    masteryByModule,
    difficultQuestions,
    strugglingStudents: strugglingStudentsRecords,
  });
};

module.exports = { getSectionAnalytics };
