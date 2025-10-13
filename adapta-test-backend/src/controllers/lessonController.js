const Lesson = require("../models/lessonModel");
const Module = require("../models/moduleModel");

// @desc    Crear una nueva lección en un módulo de la biblioteca del profesor
// @route   POST /api/modules/:moduleId/lessons
// @access  Private/Professor (solo el dueño del módulo)
const createLessonInModule = async (req, res) => {
  const { title, content, contentType, fileUrl } = req.body;
  const { moduleId } = req.params;

  // 1. Verificar que el módulo padre existe DENTRO de la institución
  const parentModule = await Module.findOne({
    _id: moduleId,
    institution: req.institution._id,
  });

  if (!parentModule) {
    return res
      .status(404)
      .json({ message: "Módulo no encontrado en esta institución." });
  }

  // 2. Verificar que el usuario es el dueño del módulo
  if (parentModule.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "No autorizado para añadir lecciones a este módulo." });
  }

  // 3. Crear la lección, asignando la institución del módulo padre
  const lesson = await Lesson.create({
    title,
    content,
    contentType,
    fileUrl,
    module: moduleId,
    order: (await Lesson.countDocuments({ module: moduleId })) + 1,
    institution: req.institution._id, // Asignar institución
  });

  res.status(201).json(lesson);
};

// @desc    Obtener todas las lecciones de un módulo de la biblioteca
// @route   GET /api/modules/:moduleId/lessons
// @access  Private
const getLessonsFromModule = async (req, res) => {
  const { moduleId } = req.params;

  // 1. Verificar que el módulo existe en la institución del usuario
  const parentModule = await Module.findOne({
    _id: moduleId,
    institution: req.institution._id,
  });
  if (!parentModule) {
    return res
      .status(404)
      .json({ message: "Módulo no encontrado en esta institución." });
  }

  // 2. Obtener las lecciones de ese módulo (ya están implícitamente seguras)
  const lessons = await Lesson.find({ module: moduleId }).sort("order");
  res.json(lessons);
};

module.exports = {
  createLessonInModule,
  getLessonsFromModule,
};
