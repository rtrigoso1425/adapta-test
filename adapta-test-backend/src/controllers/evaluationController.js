import EvaluationSession from '../models/evaluationSessionModel.js';
import PerformanceLog from '../models/performanceLogModel.js';
import Question from '../models/questionModel.js';
import Module from '../models/moduleModel.js';

// --- LÓGICA DEL ALGORITMO ADAPTATIVO ---
const selectNextQuestion = async (session) => {
    // 1. Determinar dificultad objetivo basada en la maestría (0-100 -> 1-5)
    const targetDifficulty = Math.min(Math.max(Math.ceil(session.currentMastery / 20), 1), 5);

    // 2. Buscar una pregunta con esa dificultad que no haya sido respondida
    let question = await Question.findOne({
        module: session.module,
        difficulty: targetDifficulty,
        _id: { $nin: session.questionsAnswered },
    });

    // 3. Fallback: Si no hay, buscar en un rango cercano
    if (!question) {
        question = await Question.findOne({
            module: session.module,
            difficulty: { $in: [targetDifficulty - 1, targetDifficulty + 1].filter(d => d > 0 && d < 6) },
            _id: { $nin: session.questionsAnswered },
        }).sort({ difficulty: -1 });
    }

    return question;
};

// @desc    Iniciar una nueva sesión de evaluación
// @route   POST /api/modules/:moduleId/evaluations/start
export const startEvaluation = async (req, res) => {
    const { moduleId } = req.params;
    const session = await EvaluationSession.create({
        student: req.user._id,
        module: moduleId,
    });
    const firstQuestion = await selectNextQuestion(session);

    if (!firstQuestion) {
        res.status(404);
        throw new Error('No se encontraron preguntas para este módulo.');
    }

    res.status(201).json({
        sessionId: session._id,
        question: {
            _id: firstQuestion._id,
            questionText: firstQuestion.questionText,
            options: firstQuestion.options.map(opt => ({ _id: opt._id, text: opt.text })),
        }
    });
};

// @desc    Enviar una respuesta y obtener la siguiente pregunta
// @route   POST /api/evaluations/:sessionId/submit
export const submitAnswer = async (req, res) => {
    const { sessionId } = req.params;
    const { questionId, answerId } = req.body;

    const session = await EvaluationSession.findById(sessionId);
    if (!session || session.student.toString() !== req.user._id.toString()) {
        res.status(404); throw new Error('Sesión no encontrada.');
    }

    const question = await Question.findById(questionId);
    const selectedOption = question.options.find(opt => opt._id.toString() === answerId);
    const isCorrect = selectedOption.isCorrect;

    // Actualizar maestría y score
    if (isCorrect) {
        session.score.correct += 1;
        session.currentMastery += question.difficulty * 2;
    } else {
        session.score.incorrect += 1;
        session.currentMastery -= (6 - question.difficulty);
    }
    session.currentMastery = Math.min(Math.max(session.currentMastery, 0), 100);

    await PerformanceLog.create({
        student: req.user._id, question: questionId, module: session.module, isCorrect, difficulty: question.difficulty,
    });

    session.questionsAnswered.push(questionId);

    // Lógica de finalización
    if (session.questionsAnswered.length >= 10 || session.currentMastery >= 95) {
        session.status = 'completed';
        await session.save();
        return res.json({
            status: 'completed',
            finalScore: session.score,
            finalMastery: session.currentMastery,
        });
    }

    const nextQuestion = await selectNextQuestion(session);
    await session.save();

    if (!nextQuestion) {
        session.status = 'completed';
        await session.save();
        return res.json({ status: 'completed', message: '¡Has respondido todas las preguntas!' });
    }

    res.json({
        status: 'in_progress',
        result: { isCorrect },
        nextQuestion: {
            _id: nextQuestion._id,
            questionText: nextQuestion.questionText,
            options: nextQuestion.options.map(opt => ({ _id: opt._id, text: opt.text })),
        }
    });
};