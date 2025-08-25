const Section = require('../models/sectionModel');
const Enrollment = require('../models/enrollmentModel');
const Mastery = require('../models/masteryModel');
const PerformanceLog = require('../models/performanceLogModel');
const Module = require('../models/moduleModel');

// @desc    Obtener las analíticas de rendimiento para una sección
// @route   GET /api/analytics/section/:sectionId
// @access  Private/Professor or Admin
const getSectionAnalytics = async (req, res) => {
    const { sectionId } = req.params;
    const section = await Section.findById(sectionId);

    // Validación de permisos (solo el instructor o un admin pueden ver las analíticas)
    if (!section) {
        res.status(404);
        throw new Error('Sección no encontrada.');
    }
    if (req.user.role === 'professor' && section.instructor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('No tienes permisos para ver las analíticas de esta sección.');
    }

    const enrollments = await Enrollment.find({ section: sectionId, status: 'enrolled' });
    const studentIds = enrollments.map(e => e.student);
    const modulesInSection = await Module.find({ 'publishedIn.section': sectionId });

    // --- 1. Calcular Maestría Promedio por Módulo ---
    const masteryByModule = [];
    for (const module of modulesInSection) {
        const masteryRecords = await Mastery.find({ student: { $in: studentIds }, module: module._id });
        const totalMastery = masteryRecords.reduce((acc, record) => acc + record.highestMasteryScore, 0);
        const averageMastery = masteryRecords.length > 0 ? totalMastery / masteryRecords.length : 0;
        masteryByModule.push({
            moduleId: module._id,
            moduleTitle: module.title,
            averageMastery: averageMastery.toFixed(2),
        });
    }

    // --- 2. Encontrar las Preguntas Más Difíciles ---
    const performanceLogs = await PerformanceLog.find({ student: { $in: studentIds } });
    const questionFailures = {};
    performanceLogs.forEach(log => {
        if (!log.isCorrect) {
            const qId = log.question.toString();
            questionFailures[qId] = (questionFailures[qId] || 0) + 1;
        }
    });
    
    const difficultQuestions = Object.entries(questionFailures)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3); // Top 3

    // (En una versión futura, podríamos poblar los datos de estas preguntas para mostrar su texto)

    // --- 3. Identificar Estudiantes con Dificultades ---
    // (Lógica simplificada: estudiantes con maestría por debajo de 40 en cualquier módulo)
    const strugglingStudents = await Mastery.find({ 
        student: { $in: studentIds }, 
        module: { $in: modulesInSection.map(m => m._id) },
        highestMasteryScore: { $lt: 40 }
    }).populate('student', 'name').populate('module', 'title');


    res.json({
        masteryByModule,
        difficultQuestions,
        strugglingStudents,
    });
};

module.exports = { getSectionAnalytics };