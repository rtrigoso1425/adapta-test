const Course = require('../models/courseModel');

// @desc    Crear un nuevo curso
// @route   POST /api/courses
// @access  Private/Admin or Private/Coordinator
const createCourse = async (req, res) => {
    // 👇 1. Extraer 'prerequisites' del body. Puede ser un array de IDs.
    const { title, description, prerequisites } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Por favor, proporciona título y descripción.');
    }

    const course = new Course({
        title,
        description,
        // 👇 2. Asignar los prerrequisitos. Si no se envían, será un array vacío.
        prerequisites: prerequisites || [],
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
};

// @desc    Obtener todos los cursos
// @route   GET /api/courses
// @access  Private (para cualquier usuario logueado)
const getCourses = async (req, res) => {
    // 👇 HEMOS QUITADO EL .populate('instructor', 'name email') DE AQUÍ
    const courses = await Course.find({});
    res.json(courses);
};


// @desc    Obtener un curso por su ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
    // 👇 HEMOS QUITADO EL .populate('instructor', 'name') DE AQUÍ
    const course = await Course.findById(req.params.id);

    if (course) {
        res.json(course);
    } else {
        res.status(404);
        throw new Error('Curso no encontrado');
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
};