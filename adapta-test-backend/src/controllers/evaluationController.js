const EvaluationSession = require("../models/evaluationSessionModel");
const PerformanceLog = require("../models/performanceLogModel");
const Question = require("../models/questionModel");
const Module = require("../models/moduleModel");
const Mastery = require("../models/masteryModel");

const selectNextQuestion = async (session) => {
  const targetDifficulty = Math.min(
    Math.max(Math.ceil(session.currentMastery / 20), 1),
    5
  );

  let question = await Question.findOne({
    module: session.module,
    difficulty: targetDifficulty,
    _id: { $nin: session.questionsAnswered },
  });

  if (!question) {
    question = await Question.findOne({
      module: session.module,
      difficulty: {
        $in: [targetDifficulty - 1, targetDifficulty + 1].filter(
          (d) => d > 0 && d < 6
        ),
      },
      _id: { $nin: session.questionsAnswered },
    }).sort({ difficulty: -1 });
  }

  return question;
};

const startEvaluation = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Validar que el módulo existe
    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({ message: "Módulo no encontrado" });
    }

    const session = await EvaluationSession.create({
      student: req.user._id,
      module: moduleId,
    });

    const firstQuestion = await selectNextQuestion(session);

    if (!firstQuestion) {
      return res.status(404).json({
        message: "No se encontraron preguntas para este módulo.",
      });
    }

    res.status(201).json({
      sessionId: session._id,
      question: {
        _id: firstQuestion._id,
        questionText: firstQuestion.questionText,
        options: firstQuestion.options.map((opt) => ({
          _id: opt._id,
          text: opt.text,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answerId } = req.body;

    const session = await EvaluationSession.findById(sessionId);
    if (!session || session.student.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Sesión no encontrada." });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada." });
    }

    const selectedOption = question.options.find(
      (opt) => opt._id.toString() === answerId
    );
    if (!selectedOption) {
      return res.status(400).json({ message: "Opción de respuesta inválida." });
    }

    const isCorrect = selectedOption.isCorrect;

    // Actualizar maestría y score
    if (isCorrect) {
      session.score.correct += 1;
      session.currentMastery += question.difficulty * 2;
    } else {
      session.score.incorrect += 1;
      session.currentMastery -= 6 - question.difficulty;
    }
    session.currentMastery = Math.min(Math.max(session.currentMastery, 0), 100);

    await PerformanceLog.create({
      student: req.user._id,
      question: questionId,
      module: session.module,
      isCorrect,
      difficulty: question.difficulty,
    });

    session.questionsAnswered.push(questionId);

    // Lógica de finalización
    if (
      session.questionsAnswered.length >= 10 ||
      session.currentMastery >= 95
    ) {
      session.status = "completed";
      await session.save();

      // 👇 NUEVA LÓGICA: Guardar o actualizar el registro de maestría
      await Mastery.findOneAndUpdate(
        { student: req.user._id, module: session.module },
        { $max: { highestMasteryScore: session.currentMastery } }, // $max solo actualiza si el nuevo valor es mayor
        { upsert: true, new: true } // 'upsert' crea el documento si no existe
      );

      return res.json({
        status: "completed",
        finalScore: session.score,
        finalMastery: session.currentMastery,
      });
    }

    const nextQuestion = await selectNextQuestion(session);
    await session.save();

    if (!nextQuestion) {
      session.status = "completed";
      await session.save();
      return res.json({
        status: "completed",
        message: "¡Has respondido todas las preguntas!",
        finalScore: session.score,
        finalMastery: session.currentMastery,
      });
    }

    res.json({
      status: "in_progress",
      result: { isCorrect },
      nextQuestion: {
        _id: nextQuestion._id,
        questionText: nextQuestion.questionText,
        options: nextQuestion.options.map((opt) => ({
          _id: opt._id,
          text: opt.text,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startEvaluation, submitAnswer };

