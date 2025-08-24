const Section = require("../models/sectionModel");
const Enrollment = require("../models/enrollmentModel");
const Mastery = require("../models/masteryModel");
const Lesson = require("../models/lessonModel");
const LessonCompletion = require("../models/lessonCompletionModel");
const Submission = require("../models/submissionModel");
const Module = require("../models/moduleModel");
const Assignment = require("../models/assignmentModel");

// @desc    Procesar las calificaciones finales para toda una sección
// @route   POST /api/grading/process-section/:sectionId
// @access  Private/Admin
const processSectionGrades = async (req, res) => {
  const { sectionId } = req.params;

  // 1. Obtener la sección y sus criterios de aprobación
  const section = await Section.findById(sectionId).populate("course");
  if (!section || !section.approvalCriteria) {
    res.status(404);
    throw new Error(
      "Sección no encontrada o sin criterios de aprobación configurados."
    );
  }

  if (
    req.user.role === "professor" &&
    section.instructor.toString() !== req.user._id.toString()
  ) {
    res.status(403); // Prohibido (Forbidden)
    throw new Error(
      "No tienes permisos para procesar las calificaciones de esta sección."
    );
  }

  // 2. Obtener todos los estudiantes matriculados en esta sección
  const enrollments = await Enrollment.find({
    section: sectionId,
    status: "enrolled",
  });

  let results = []; // Para guardar el resultado de cada estudiante

  // 3. Iterar sobre cada estudiante y verificar si cumple los criterios
  for (const enrollment of enrollments) {
    const studentId = enrollment.student;
    const criteria = section.approvalCriteria;
    let allCriteriaMet = true; // Asumimos que aprueba hasta que un criterio falle
    let failureReason = "";

    // --- Verificación del Pilar 1: Maestría ---
    if (criteria.mastery.required) {
      const modulesInSection = await Module.find({
        "publishedIn.section": sectionId,
      });
      for (const module of modulesInSection) {
        const masteryRecord = await Mastery.findOne({
          student: studentId,
          module: module._id,
        });
        if (
          !masteryRecord ||
          masteryRecord.highestMasteryScore < criteria.mastery.minPercentage
        ) {
          allCriteriaMet = false;
          failureReason = `No alcanzó el ${criteria.mastery.minPercentage}% de maestría en el módulo "${module.title}".`;
          break; // No es necesario seguir revisando otros módulos
        }
      }
    }

    // --- Verificación del Pilar 2: Completitud de Tareas (si no ha fallado aún) ---
    if (allCriteriaMet && criteria.completion.allAssignmentsRequired) {
      const assignmentsInSection = await Assignment.find({
        section: sectionId,
      });
      const studentSubmissions = await Submission.find({
        student: studentId,
        assignment: { $in: assignmentsInSection.map((a) => a._id) },
      });

      if (studentSubmissions.length < assignmentsInSection.length) {
        allCriteriaMet = false;
        failureReason = "No entregó todas las tareas obligatorias.";
      }
    }

    // --- (Aquí iría la lógica para lecciones y exámenes sumativos si se implementa) ---

    // 4. Actualizar el estado de la matrícula del estudiante
    enrollment.status = allCriteriaMet ? "passed" : "failed";
    await enrollment.save();

    results.push({
      student: enrollment.student,
      status: enrollment.status,
      reason: failureReason,
    });
  }

  res.status(200).json({
    message: `Procesamiento de la sección "${section.course.title} - ${section.sectionCode}" completado.`,
    results,
  });
};

// @desc    Obtener una vista previa del estado de calificación de una sección
// @route   GET /api/grading/preview/:sectionId
// @access  Private/Professor or Admin
const getGradingPreview = async (req, res) => {
  const { sectionId } = req.params;
  const section = await Section.findById(sectionId).populate("course");

  // ... (Validación de permisos igual que en processSectionGrades)
  if (!section) {
    res.status(404);
    throw new Error("Sección no encontrada.");
  }
  if (
    req.user.role === "professor" &&
    section.instructor.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("No tienes permisos para ver esta sección.");
  }

  const enrollments = await Enrollment.find({
    section: sectionId,
    status: "enrolled",
  }).populate("student", "name");
  const criteria = section.approvalCriteria;
  let previewResults = [];

  for (const enrollment of enrollments) {
    const studentId = enrollment.student._id;
    let studentPreview = {
      student: enrollment.student,
      enrollmentId: enrollment._id,
      finalStatus: "Pendiente",
      checks: [],
    };

    // --- Verificación de Maestría ---
    if (criteria.mastery?.required) {
      const modulesInSection = await Module.find({
        "publishedIn.section": sectionId,
      });
      let modulesPassed = 0;
      for (const module of modulesInSection) {
        const masteryRecord = await Mastery.findOne({
          student: studentId,
          module: module._id,
        });
        if (
          masteryRecord &&
          masteryRecord.highestMasteryScore >= criteria.mastery.minPercentage
        ) {
          modulesPassed++;
        }
      }
      studentPreview.checks.push({
        name: "Maestría",
        status: `${modulesPassed} / ${modulesInSection.length} módulos superan el ${criteria.mastery.minPercentage}%`,
        isMet: modulesPassed === modulesInSection.length,
      });
    }

    // --- Verificación de Tareas ---
    if (criteria.completion?.allAssignmentsRequired) {
      const assignmentsInSection = await Assignment.find({
        section: sectionId,
      });
      const submissionCount = await Submission.countDocuments({
        student: studentId,
        assignment: { $in: assignmentsInSection.map((a) => a._id) },
      });
      studentPreview.checks.push({
        name: "Tareas Entregadas",
        status: `${submissionCount} / ${assignmentsInSection.length}`,
        isMet: submissionCount === assignmentsInSection.length,
      });
    }

    previewResults.push(studentPreview);
  }
  res.json(previewResults);
};

module.exports = { processSectionGrades, getGradingPreview };
