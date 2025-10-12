const Question = require("../models/questionModel");
const Module = require("../models/moduleModel");

// @desc    Crear una nueva pregunta en un módulo
// @route   POST /api/modules/:moduleId/questions
// @access  Private/Professor
const createQuestion = async (req, res) => {
  const { moduleId } = req.params;
  const { questionText, options, difficulty } = req.body;

  const parentModule = await Module.findOne({
    _id: moduleId,
    institution: req.institution._id,
  });
  if (!parentModule) {
    return res
      .status(404)
      .json({ message: "Módulo no encontrado en esta institución." });
  }

  if (parentModule.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "No autorizado para añadir preguntas a este módulo." });
  }

  const question = await Question.create({
    module: moduleId,
    owner: req.user._id,
    questionText,
    options,
    difficulty,
    institution: req.institution._id, // Asignar institución
  });

  res.status(201).json(question);
};

// @desc    Obtener todas las preguntas de un módulo
// @route   GET /api/modules/:moduleId/questions
// @access  Private/Professor
const getQuestionsForModule = async (req, res) => {
  const { moduleId } = req.params;

  const parentModule = await Module.findOne({
    _id: moduleId,
    institution: req.institution._id,
  });
  if (!parentModule) {
    return res
      .status(404)
      .json({ message: "Módulo no encontrado en esta institución." });
  }

  if (parentModule.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "No autorizado para ver estas preguntas." });
  }

  const questions = await Question.find({ module: moduleId });
  res.json(questions);
};

// @desc    Actualizar una pregunta
// @route   PUT /api/questions/:questionId
// @access  Private/Professor (solo el dueño)
const updateQuestion = async (req, res) => {
  const { questionText, options, difficulty } = req.body;

  const question = await Question.findOne({
    _id: req.params.questionId,
    institution: req.institution._id,
  });

  if (!question) {
    res.status(404);
    throw new Error("Pregunta no encontrada.");
  }

  if (question.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Usuario no autorizado para modificar esta pregunta.");
  }

  question.questionText = questionText || question.questionText;
  question.options = options || question.options;
  question.difficulty = difficulty || question.difficulty;

  const updatedQuestion = await question.save();
  res.json(updatedQuestion);
};

// @desc    Eliminar una pregunta
// @route   DELETE /api/questions/:questionId
// @access  Private/Professor (solo el dueño)
const deleteQuestion = async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.questionId,
    institution: req.institution._id,
  });

  if (!question) {
    res.status(404);
    throw new Error("Pregunta no encontrada.");
  }

  if (question.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Usuario no autorizado para eliminar esta pregunta.");
  }

  await question.deleteOne(); // Usamos deleteOne() en Mongoose v6+
  res.json({ message: "Pregunta eliminada exitosamente." });
};

module.exports = {
  createQuestion,
  getQuestionsForModule,
  updateQuestion,
  deleteQuestion,
};
