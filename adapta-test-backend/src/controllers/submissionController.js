// src/controllers/submissionController.js
const Submission = require("../models/submissionModel");
const Assignment = require("../models/assignmentModel");
const Enrollment = require("../models/enrollmentModel");

// @desc    Estudiante entrega una tarea
// @route   POST /api/assignments/:assignmentId/submit
// @access  Private/Student
const createSubmission = async (req, res) => {
  const { assignmentId } = req.params;
  const { content, fileUrl } = req.body;
  const studentId = req.user._id;

  // 1. Validación: ¿La tarea existe DENTRO de la institución del estudiante?
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    institution: req.institution._id,
  });
  if (!assignment) {
    return res
      .status(404)
      .json({ message: "Tarea no encontrada en esta institución." });
  }

  // 2. Validación: ¿El estudiante está matriculado en la sección de esta tarea?
  const isEnrolled = await Enrollment.findOne({
    student: studentId,
    section: assignment.section,
    status: "enrolled",
    institution: req.institution._id, // Añadimos filtro de institución por seguridad
  });
  if (!isEnrolled) {
    return res
      .status(403)
      .json({
        message:
          "No estás matriculado en el curso correspondiente para entregar esta tarea.",
      });
  }

  // 3. Validación: ¿Ya ha entregado esta tarea?
  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: studentId,
  });
  if (existingSubmission) {
    return res
      .status(400)
      .json({ message: "Ya has realizado la entrega para esta tarea." });
  }

  // 4. Crear la entrega, asignando la institución
  const submission = await Submission.create({
    assignment: assignmentId,
    student: studentId,
    content,
    fileUrl,
    institution: req.institution._id, // Asignar institución
  });

  res.status(201).json(submission);
};

// @desc    Profesor obtiene todas las entregas de una tarea
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private/Professor
const getSubmissionsForAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  // 1. Validar que la tarea exista en la institución del profesor
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    institution: req.institution._id,
  }).populate("section");

  if (!assignment) {
    return res
      .status(404)
      .json({ message: "Tarea no encontrada en esta institución." });
  }

  // 2. Validar que el profesor sea el instructor de la sección de la tarea
  if (assignment.section.instructor.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({
        message: "No estás autorizado para ver las entregas de esta tarea.",
      });
  }

  // 3. Obtener las entregas, filtrando por institución
  const submissions = await Submission.find({
    assignment: assignmentId,
    institution: req.institution._id,
  }).populate("student", "name email");

  res.json(submissions);
};

// @desc    Profesor califica una entrega
// @route   PUT /api/submissions/:submissionId/grade
// @access  Private/Professor
const gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  // 1. Buscar la entrega DENTRO de la institución del profesor
  const submission = await Submission.findOne({
    _id: submissionId,
    institution: req.institution._id,
  }).populate({ path: "assignment", populate: { path: "section" } });

  if (!submission) {
    return res
      .status(404)
      .json({ message: "Entrega no encontrada en esta institución." });
  }

  // 2. Validar que el profesor sea el instructor de la sección correspondiente
  if (
    submission.assignment.section.instructor.toString() !==
    req.user._id.toString()
  ) {
    return res
      .status(403)
      .json({ message: "No estás autorizado para calificar esta entrega." });
  }

  submission.grade = grade;
  submission.feedback = feedback;
  const updatedSubmission = await submission.save();

  res.json(updatedSubmission);
};

// @desc    Estudiante obtiene su propia entrega para una tarea
// @route   GET /api/assignments/:assignmentId/mysubmission
// @access  Private/Student
const getMySubmissionForAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const studentId = req.user._id;

  const submission = await Submission.findOne({
    assignment: assignmentId,
    student: studentId,
    institution: req.institution._id, // Filtrar por institución
  });

  if (!submission) {
    // No es un error, simplemente no ha entregado. El frontend manejará el `null`.
    return res.json(null);
  }

  res.json(submission);
};

module.exports = {
  createSubmission,
  getSubmissionsForAssignment,
  gradeSubmission,
  getMySubmissionForAssignment,
};
