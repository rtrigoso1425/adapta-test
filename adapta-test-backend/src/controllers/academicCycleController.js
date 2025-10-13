// src/controllers/academicCycleController.js
const AcademicCycle = require("../models/academicCycleModel");

// @desc    Crear un nuevo ciclo académico
// @route   POST /api/academic-cycles
// @access  Private/Admin
const createCycle = async (req, res) => {
  const { name, startDate, endDate, isActive } = req.body;

  // Validar que no exista un ciclo con el mismo nombre en la institución
  const cycleExists = await AcademicCycle.findOne({
    name,
    institution: req.institution._id,
  });
  if (cycleExists) {
    return res
      .status(400)
      .json({
        message: "Un ciclo con este nombre ya existe en esta institución.",
      });
  }

  const cycle = await AcademicCycle.create({
    name,
    startDate,
    endDate,
    isActive,
    institution: req.institution._id, // Asignar institución
  });
  res.status(201).json(cycle);
};

// @desc    Obtener todos los ciclos de la institución
// @route   GET /api/academic-cycles
// @access  Private
const getCycles = async (req, res) => {
  const cycles = await AcademicCycle.find({ institution: req.institution._id }); // Filtrar por institución
  res.json(cycles);
};

module.exports = { createCycle, getCycles };
