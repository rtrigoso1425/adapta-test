const Section = require('../models/sectionModel');
const Course = require('../models/courseModel');

// @desc    Crear una nueva sección para un curso
// @route   POST /api/courses/:courseId/sections
// @access  Private/Admin or Private/Coordinator
const createSection = async (req, res) => {
    const { instructor, academicCycle, sectionCode, capacity } = req.body;
    const { courseId } = req.params;

    // Verificar que el curso exista
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
        res.status(404);
        throw new Error('Curso no encontrado.');
    }

    const section = await Section.create({
        course: courseId,
        instructor,
        academicCycle,
        sectionCode,
        capacity,
    });

    res.status(201).json(section);
};

// @desc    Obtener todas las secciones de un curso
// @route   GET /api/courses/:courseId/sections
// @access  Private
const getSectionsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const sections = await Section.find({ course: courseId }).populate('instructor', 'name');
    res.json(sections);
};

// @desc    Obtener las secciones asignadas a un instructor
// @route   GET /api/sections/my-sections
// @access  Private/Professor
const getMySections = async (req, res) => {
    const sections = await Section.find({ instructor: req.user._id })
        .populate('course', 'title') // Del curso, trae el título
        .populate('academicCycle', 'name'); // Del ciclo, trae el nombre

    res.json(sections);
};

module.exports = { createSection, getSectionsForCourse, getMySections };