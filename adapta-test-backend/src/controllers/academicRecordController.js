// src/controllers/academicRecordController.js
const AcademicRecord = require("../models/academicRecordModel");
const Career = require("../models/careerModel");

// @desc    Estudiante se inscribe en una carrera
// @route   POST /api/academic-records/enroll
// @access  Private/Student
const enrollInCareer = async (req, res) => {
  const { careerId } = req.body;
  const studentId = req.user._id;

  // 1. Validar que la carrera exista DENTRO de la misma institución que el estudiante
  const careerExists = await Career.findOne({
    _id: careerId,
    institution: req.institution._id,
  });
  if (!careerExists) {
    return res
      .status(404)
      .json({
        message: "La carrera seleccionada no existe en tu institución.",
      });
  }

  // 2. Verificar que el estudiante no tenga ya un expediente
  const recordExists = await AcademicRecord.findOne({
    student: studentId,
    institution: req.institution._id,
  });
  if (recordExists) {
    return res
      .status(400)
      .json({ message: "Ya te encuentras inscrito en una carrera." });
  }

  // 3. Crear el expediente, asignando la institución
  const academicRecord = await AcademicRecord.create({
    student: studentId,
    career: careerId,
    institution: req.institution._id,
  });

  res.status(201).json(academicRecord);
};

module.exports = { enrollInCareer };
