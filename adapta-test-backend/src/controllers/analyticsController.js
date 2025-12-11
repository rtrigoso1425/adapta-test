// src/controllers/analyticsController.js
const Section = require("../models/sectionModel");
const Enrollment = require("../models/enrollmentModel");
const Mastery = require("../models/masteryModel");
const PerformanceLog = require("../models/performanceLogModel");
const Module = require("../models/moduleModel");
const Question = require("../models/questionModel"); // <--- 1. IMPORTANTE: Importamos el modelo de Preguntas

// @desc    Obtener las analíticas de rendimiento para una sección
// @route   GET /api/analytics/section/:sectionId
// @access  Private/Professor or Admin
const getSectionAnalytics = async (req, res) => {
  const { sectionId } = req.params;
  const institutionId = req.institution._id;

  // 1. Validar que la sección exista en la institución
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

  // 2. Obtener los IDs de los estudiantes matriculados
  const enrollments = await Enrollment.find({
    section: sectionId,
    status: "enrolled",
    institution: institutionId,
  });
  const studentIds = enrollments.map((e) => e.student);

  if (studentIds.length === 0) {
    return res.json({
      message: "No hay estudiantes matriculados para generar analíticas.",
      masteryByModule: [],
      difficultQuestions: [],
      strugglingStudents: []
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

  // --- Encontrar las Preguntas Más Difíciles (CON TEXTO) ---
  const performanceLogs = await PerformanceLog.find({
    student: { $in: studentIds },
    module: { $in: moduleIds },
    institution: institutionId,
  });

  // A. Contar fallos (igual que antes)
  const questionFailures = {};
  performanceLogs.forEach((log) => {
    if (!log.isCorrect) {
      const qId = log.question.toString();
      questionFailures[qId] = (questionFailures[qId] || 0) + 1;
    }
  });

  // B. Ordenar y sacar el Top 5 (IDs)
  const sortedFailures = Object.entries(questionFailures)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // [[id1, 10], [id2, 8]...]

  // C. NUEVO: Buscar los detalles de esas preguntas en la DB
  const topQuestionIds = sortedFailures.map(([id]) => id);
  
  const questionsDetails = await Question.find({
    _id: { $in: topQuestionIds }
  }).select('questionText difficulty'); // Solo traemos el texto y dificultad para ser eficientes

  // D. Combinar los datos (Contador + Texto)
  const difficultQuestions = sortedFailures.map(([id, count]) => {
    // Buscamos el objeto completo que coincida con el ID
    const questionObj = questionsDetails.find(q => q._id.toString() === id);
    // Retornamos el objeto completo si existe, si no, el ID como fallback
    return [questionObj || id, count];
  });

  // --- Identificar Estudiantes con Dificultades ---
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
    difficultQuestions, // Ahora contiene objetos completos
    strugglingStudents: strugglingStudentsRecords,
  });
};

module.exports = { getSectionAnalytics };