// src/controllers/moduleController.js
const Module = require('../models/moduleModel');
const Course = require('../models/courseModel');
const Section = require('../models/sectionModel');

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
// @desc    "Publicar" un módulo en una sección específica
// @route   POST /api/sections/:sectionId/modules
// @access  Private/Professor
const publishModuleToSection = async (req, res) => {
    const { moduleId } = req.body;
    const { sectionId } = req.params;

    // 1. Validar que la sección y el módulo existen
    const section = await Section.findById(sectionId);
    const module = await Module.findById(moduleId);
    if (!section || !module) {
        res.status(404);
        throw new Error('Sección o Módulo no encontrado.');
    }

    // 2. Validar que el usuario es el instructor de la sección Y el dueño del módulo
    if (section.instructor.toString() !== req.user._id.toString() || module.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Usuario no autorizado para esta acción.');
    }

    // 4. Añadir la referencia de publicación a la sección
    module.publishedIn.push({ section: sectionId });
    await module.save();

    res.status(200).json(module);
};

// @desc    Obtener los módulos publicados en un curso específico
// @route   GET /api/courses/:courseId/modules
// @access  Private
// @desc    Obtener los módulos publicados en una sección específica
// @route   GET /api/sections/:sectionId/modules
// @access  Private
const getPublishedModulesForSection = async (req, res) => {
    const { sectionId } = req.params;
    const modules = await Module.find({ 'publishedIn.section': sectionId }).sort('order');
    res.json(modules);
};

module.exports = {
    createModuleInLibrary,
    getMyLibraryModules,
    publishModuleToSection,
    getPublishedModulesForSection,
    // Añadimos aquí las funciones que faltan
};