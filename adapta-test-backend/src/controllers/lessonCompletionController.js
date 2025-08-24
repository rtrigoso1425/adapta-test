const LessonCompletion = require("../models/lessonCompletionModel");

// @desc    Marcar una lección como completada
// @route   POST /api/lessons/:id/complete
const completeLesson = async (req, res) => {
  const lessonId = req.params.id;
  const studentId = req.user._id;
  const { sectionId } = req.body; // El frontend nos dirá en qué contexto de sección se completó

  await LessonCompletion.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    { student: studentId, lesson: lessonId, section: sectionId },
    { upsert: true }
  );

  res.status(200).json({ message: "Lección marcada como completada." });
};

// @desc    Obtener las lecciones completadas por un estudiante en una sección
// @route   GET /api/sections/:sectionId/completed-lessons
const getCompletedLessons = async (req, res) => {
  const { sectionId } = req.params;
  const studentId = req.user._id;

  const completions = await LessonCompletion.find({
    student: studentId,
    section: sectionId,
  });
  // Devolvemos solo un array de IDs de las lecciones
  const lessonIds = completions.map((c) => c.lesson);
  res.json(lessonIds);
};

module.exports = { completeLesson, getCompletedLessons };
