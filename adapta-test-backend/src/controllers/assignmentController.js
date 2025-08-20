const Assignment = require('../models/assignmentModel');
const Section = require('../models/sectionModel');

// @desc    Crear una nueva tarea en una sección
// @route   POST /api/sections/:sectionId/assignments
// @access  Private/Professor
const createAssignment = async (req, res) => {
    const { sectionId } = req.params;
    const { title, instructions, dueDate, pointsPossible } = req.body;

    // Validar que la sección exista y que el profesor sea el instructor
    const section = await Section.findById(sectionId);
    if (!section) {
        res.status(404);
        throw new Error('Sección no encontrada.');
    }
    if (section.instructor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Usuario no autorizado para crear tareas en esta sección.');
    }

    const assignment = await Assignment.create({
        section: sectionId,
        title,
        instructions,
        dueDate,
        pointsPossible,
    });

    res.status(201).json(assignment);
};

// @desc    Obtener todas las tareas de una sección
// @route   GET /api/sections/:sectionId/assignments
// @access  Private
const getAssignmentsForSection = async (req, res) => {
    const { sectionId } = req.params;
    const assignments = await Assignment.find({ section: sectionId }).sort('dueDate');
    res.json(assignments);
};

module.exports = { createAssignment, getAssignmentsForSection };