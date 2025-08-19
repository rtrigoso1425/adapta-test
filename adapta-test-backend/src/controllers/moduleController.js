// src/controllers/moduleController.js
const Module = require('../models/moduleModel');
const Course = require('../models/courseModel');

// @desc    Crear un nuevo módulo en la biblioteca personal del profesor
// @route   POST /api/modules
// @access  Private/Professor
const createModuleInLibrary = async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('El título es obligatorio.');
    }

    const module = await Module.create({
        title,
        description,
        owner: req.user._id, // El dueño es el profesor logueado
    });
    res.status(201).json(module);
};

// @desc    Obtener los módulos de la biblioteca del profesor logueado
// @route   GET /api/modules/my-library
// @access  Private/Professor
const getMyLibraryModules = async (req, res) => {
    const modules = await Module.find({ owner: req.user._id });
    res.json(modules);
};

// @desc    "Publicar" un módulo de la biblioteca en un curso específico
// @route   POST /api/courses/:courseId/modules
// @access  Private/Professor
const publishModuleToCourse = async (req, res) => {
    const { moduleId } = req.body;
    const { courseId } = req.params;

    // 1. Validar que el curso y el módulo existen
    const course = await Course.findById(courseId);
    const module = await Module.findById(moduleId);
    if (!course || !module) {
        res.status(404);
        throw new Error('Curso o Módulo no encontrado.');
    }

    // 2. Validar que el usuario es el instructor asignado al curso Y el dueño del módulo
    if (course.instructor.toString() !== req.user._id.toString() || module.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Usuario no autorizado para esta acción.');
    }

    // 3. (Lógica de ciclo simplificada por ahora)
    // En una implementación completa, aquí obtendríamos el ciclo activo.
    // Por ahora, simularemos que no hay ciclo específico.

    // 4. Añadir la referencia de publicación al módulo
    module.publishedIn.push({ course: courseId });
    await module.save();

    res.status(200).json(module);
};

// @desc    Obtener los módulos publicados en un curso específico
// @route   GET /api/courses/:courseId/modules
// @access  Private
const getPublishedModulesInCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await Module.find({ 'publishedIn.course': courseId }).sort('order');
    res.json(modules);
};

module.exports = {
    createModuleInLibrary,
    getMyLibraryModules,
    publishModuleToCourse,
    getPublishedModulesInCourse,
};