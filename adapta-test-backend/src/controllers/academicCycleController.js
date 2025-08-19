const AcademicCycle = require('../models/academicCycleModel');

// @desc    Crear un nuevo ciclo académico
// @route   POST /api/academic-cycles
// @access  Private/Admin
const createCycle = async (req, res) => {
    const { name, startDate, endDate, isActive } = req.body;
    const cycle = await AcademicCycle.create({ name, startDate, endDate, isActive });
    res.status(201).json(cycle);
};

// @desc    Obtener todos los ciclos
// @route   GET /api/academic-cycles
// @access  Private
const getCycles = async (req, res) => {
    const cycles = await AcademicCycle.find({});
    res.json(cycles);
};

module.exports = { createCycle, getCycles };