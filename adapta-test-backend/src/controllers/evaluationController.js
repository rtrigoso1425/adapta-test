const EvaluationSession = require("../models/evaluationSessionModel");
const PerformanceLog = require("../models/performanceLogModel");
const Question = require("../models/questionModel");
const Module = require("../models/moduleModel");
const Mastery = require("../models/masteryModel");
const InstitutionRulesService = require("../services/institutionRulesService");

const selectNextQuestion = async (session, institution) => {
  const rules = InstitutionRulesService.getRulesForInstitution(institution);

  // La dificultad objetivo se basa en las reglas de la institución
  const targetDifficulty = Math.min(
    Math.max(
      Math.ceil(
        session.currentMastery / (100 / rules.evaluationRules.difficultyLevels)
      ),
      1
    ),
    rules.evaluationRules.difficultyLevels
  );

  // Buscamos preguntas que pertenezcan al módulo Y a la institución
  let question = await Question.findOne({
    module: session.module,
    difficulty: targetDifficulty,
    _id: { $nin: session.questionsAnswered },
    institution: institution._id, // Filtro de institución
  });

  // Lógica de fallback si no se encuentran preguntas (se mantiene igual, pero el filtro es clave)
  if (!question) {
    const difficulties = [targetDifficulty - 1, targetDifficulty + 1].filter(
      (d) => d > 0 && d < rules.evaluationRules.difficultyLevels + 1
    );
    question = await Question.findOne({
      module: session.module,
      difficulty: { $in: difficulties },
      _id: { $nin: session.questionsAnswered },
      institution: institution._id, // Filtro de institución
    }).sort({ difficulty: -1 });
  }

  return question;
};

const startEvaluation = async (req, res) => {
  const { moduleId } = req.params;

  const moduleExists = await Module.findOne({
    _id: moduleId,
    institution: req.institution._id,
  });
  if (!moduleExists) {
    return res
      .status(404)
      .json({ message: "Módulo no encontrado en esta institución" });
  }

  const session = await EvaluationSession.create({
    student: req.user._id,
    module: moduleId,
    institution: req.institution._id, // Asignar institución
  });

  const firstQuestion = await selectNextQuestion(session, req.institution);

  if (!firstQuestion) {
    return res
      .status(404)
      .json({ message: "No se encontraron preguntas para este módulo." });
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
};

const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answerId } = req.body;

    // 1. Validar que la sesión de evaluación pertenece al estudiante Y a su institución
    const session = await EvaluationSession.findOne({
      _id: sessionId,
      student: req.user._id,
      institution: req.institution._id,
    });
    if (!session || session.status === "completed") {
      return res
        .status(404)
        .json({ message: "Sesión no encontrada o ya ha sido completada." });
    }

    // 2. Validar que la pregunta que se está respondiendo pertenece a la institución
    const question = await Question.findOne({
      _id: questionId,
      institution: req.institution._id,
    });
    if (!question) {
      return res
        .status(404)
        .json({ message: "Pregunta no encontrada en esta institución." });
    }

    // 3. Obtener las reglas de evaluación para la institución actual
    const rules = InstitutionRulesService.getRulesForInstitution(
      req.institution
    );

    const selectedOption = question.options.find(
      (opt) => opt._id.toString() === answerId
    );
    if (!selectedOption) {
      return res.status(400).json({ message: "Opción de respuesta inválida." });
    }

    const isCorrect = selectedOption.isCorrect;

    // 4. Actualizar la maestría y el puntaje según la respuesta
    if (isCorrect) {
      session.score.correct += 1;
      session.currentMastery += question.difficulty * 2; // Bonificación por acierto
    } else {
      session.score.incorrect += 1;
      // La penalización es mayor para preguntas más fáciles
      session.currentMastery -=
        rules.evaluationRules.difficultyLevels + 1 - question.difficulty;
    }
    // Asegurar que la maestría se mantenga entre 0 y 100
    session.currentMastery = Math.min(Math.max(session.currentMastery, 0), 100);

    // 5. Registrar el intento en el log de rendimiento
    await PerformanceLog.create({
      student: req.user._id,
      question: questionId,
      module: session.module,
      isCorrect,
      difficulty: question.difficulty,
      institution: req.institution._id,
    });

    session.questionsAnswered.push(questionId);

    // 6. Lógica de finalización: ¿Se alcanzó el número máximo de preguntas o el umbral de maestría?
    const hasReachedMaxQuestions =
      session.questionsAnswered.length >= rules.evaluationRules.maxQuestions;
    const hasReachedMastery =
      session.currentMastery >= rules.evaluationRules.masteryThreshold;

    if (hasReachedMaxQuestions || hasReachedMastery) {
      session.status = "completed";
      await session.save();

      // Actualizar el registro de maestría más alto del estudiante para este módulo
      await Mastery.findOneAndUpdate(
        {
          student: req.user._id,
          module: session.module,
          institution: req.institution._id,
        },
        { $max: { highestMasteryScore: session.currentMastery } },
        { upsert: true, new: true }
      );

      return res.json({
        status: "completed",
        finalScore: session.score,
        finalMastery: session.currentMastery,
      });
    }

    // 7. Si la evaluación no ha terminado, buscar la siguiente pregunta
    const nextQuestion = await selectNextQuestion(session, req.institution);
    await session.save();

    if (!nextQuestion) {
      // Si no hay más preguntas disponibles, se finaliza la evaluación
      session.status = "completed";
      await session.save();
      await Mastery.findOneAndUpdate(
        {
          student: req.user._id,
          module: session.module,
          institution: req.institution._id,
        },
        { $max: { highestMasteryScore: session.currentMastery } },
        { upsert: true, new: true }
      );

      return res.json({
        status: "completed",
        message:
          "¡Felicidades! Has respondido todas las preguntas disponibles.",
        finalScore: session.score,
        finalMastery: session.currentMastery,
      });
    }

    // 8. Enviar la siguiente pregunta al frontend
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
    console.error("Error en submitAnswer:", error);
    res
      .status(500)
      .json({ message: "Ocurrió un error al procesar tu respuesta." });
  }
};

module.exports = { startEvaluation, submitAnswer };
