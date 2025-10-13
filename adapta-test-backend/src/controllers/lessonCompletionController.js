// src/controllers/lessonCompletionController.js
const LessonCompletion = require("../models/lessonCompletionModel");
const Lesson = require("../models/lessonModel");
const Section = require("../models/sectionModel");

// @desc    Marcar una lección como completada
// @route   POST /api/modules/:moduleId/lessons/:id/complete
// @access  Private/Student
const completeLesson = async (req, res) => {
  const { id: lessonId } = req.params;
  const studentId = req.user._id;
  const { sectionId } = req.body; // El frontend nos dirá el contexto de la sección

  // --- Validaciones de seguridad ---
  // 1. Verificar que la lección existe en la institución.
  const lesson = await Lesson.findOne({
    _id: lessonId,
    institution: req.institution._id,
  });
  if (!lesson) {
    return res
      .status(404)
      .json({ message: "Lección no encontrada en esta institución." });
  }

  // 2. Verificar que la sección existe en la institución.
  const section = await Section.findOne({
    _id: sectionId,
    institution: req.institution._id,
  });
  if (!section) {
    return res
      .status(404)
      .json({ message: "Sección no encontrada en esta institución." });
  }

  // (Opcional, pero recomendado) Verificar que el estudiante esté matriculado en esa sección.

  // 3. Crear o actualizar el registro de finalización, asignando la institución.
  await LessonCompletion.findOneAndUpdate(
    { student: studentId, lesson: lessonId, institution: req.institution._id },
    {
      student: studentId,
      lesson: lessonId,
      section: sectionId,
      institution: req.institution._id,
    },
    { upsert: true }
  );

  res.status(200).json({ message: "Lección marcada como completada." });
};

// @desc    Obtener las lecciones completadas por un estudiante en una sección
// @route   GET /api/sections/:sectionId/completed-lessons
// @access  Private/Student
const getCompletedLessons = async (req, res) => {
  const { sectionId } = req.params;
  const studentId = req.user._id;

  // 1. Validar que la sección exista en la institución del estudiante.
  const sectionExists = await Section.exists({
    _id: sectionId,
    institution: req.institution._id,
  });
  if (!sectionExists) {
    return res
      .status(404)
      .json({ message: "Sección no encontrada en esta institución." });
  }

  // 2. Buscar los registros de finalización para ese estudiante en esa sección.
  const completions = await LessonCompletion.find({
    student: studentId,
    section: sectionId,
    institution: req.institution._id,
  });

  // Devolvemos solo un array de IDs de las lecciones completadas.
  const lessonIds = completions.map((c) => c.lesson);
  res.json(lessonIds);
};

module.exports = { completeLesson, getCompletedLessons };
