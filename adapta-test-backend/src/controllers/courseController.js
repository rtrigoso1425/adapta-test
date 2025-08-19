const Course = require('../models/courseModel');

// @desc    Crear un nuevo curso
// @route   POST /api/courses
// @access  Private/Admin or Private/Coordinator
// @desc    Crear un nuevo curso
// @route   POST /api/courses
// @access  Private/Admin or Private/Coordinator
const createCourse = async (req, res) => {
    // 1. Extraemos TODOS los datos del cuerpo, incluyendo el ID del instructor
    const { title, description, instructor } = req.body;

    // 2. Validamos que tengamos todos los datos necesarios
    if (!title || !description || !instructor) {
        res.status(400);
        throw new Error('Por favor, proporciona título, descripción e ID del instructor.');
    }

    // NOTA: En una versión futura, podríamos validar aquí que el 'instructor'
    // que se pasa es realmente un usuario con rol 'professor'.

    // 3. Creamos el curso con el ID del instructor que viene en el body
    const course = new Course({
        title,
        description,
        instructor, // <-- ¡CORREGIDO! Ahora usa el ID del body.
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
};

// @desc    Obtener todos los cursos
// @route   GET /api/courses
// @access  Private (para cualquier usuario logueado)
const getCourses = async (req, res) => {
    // Buscamos todos los cursos y populamos los datos del instructor
    // con 'name' y 'email' para no tener que hacer otra consulta
    const courses = await Course.find({}).populate('instructor', 'name email');
    res.json(courses);
};

// @desc    Obtener los cursos asignados a un instructor
// @route   GET /api/courses/mycourses
// @access  Private/Professor
const getMyCourses = async (req, res) => {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
};


module.exports = {
    createCourse,
    getCourses,
    getMyCourses,
};