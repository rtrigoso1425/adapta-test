const Enrollment = require('../models/enrollmentModel');
const Section = require('../models/sectionModel');

// @desc    Matricular un estudiante en una sección
// @route   POST /api/enrollments
// @access  Private/Admin or Private/Coordinator
const enrollStudent = async (req, res) => {
    const { studentId, sectionId } = req.body;

    // 1. Validar que la sección exista
    const section = await Section.findById(sectionId);
    if (!section) {
        res.status(404);
        throw new Error('Sección no encontrada.');
    }

    // 2. Validar capacidad de la sección
    const enrolledCount = await Enrollment.countDocuments({ section: sectionId });
    if (enrolledCount >= section.capacity) {
        res.status(400);
        throw new Error('La sección ha alcanzado su capacidad máxima.');
    }

    // 3. (Aquí iría la lógica de prerrequisitos y límite de intentos)

    // 4. Crear la matrícula
    try {
        const enrollment = await Enrollment.create({ student: studentId, section: sectionId });
        res.status(201).json(enrollment);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('El estudiante ya está matriculado en esta sección.');
        }
        throw error;
    }
};

// @desc    Obtener los cursos matriculados del estudiante logueado
// @route   GET /api/enrollments/my-enrollments
// @access  Private/Student
const getMyEnrollments = async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id })
        .populate({
            path: 'section',
            select: 'sectionCode', // Campos que queremos de la sección
            populate: [ // Populamos anidado para obtener más detalles
                { path: 'course', select: 'title description' },
                { path: 'instructor', select: 'name' },
                { path: 'academicCycle', select: 'name' }
            ]
        });

    res.json(enrollments);
};

module.exports = { enrollStudent, getMyEnrollments };