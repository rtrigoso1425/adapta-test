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

  // Validación 1: ¿El estudiante está matriculado en la sección de esta tarea?
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error("Tarea no encontrada.");
  }
  const isEnrolled = await Enrollment.findOne({
    student: studentId,
    section: assignment.section,
    status: "enrolled",
  });

  if (!isEnrolled) {
    res.status(403); // Prohibido
    throw new Error(
      "No estás matriculado en el curso correspondiente para entregar esta tarea."
    );
  }

  // Validación 2: ¿Ya ha entregado esta tarea?
  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: studentId,
  });
  if (existingSubmission) {
    res.status(400); // Bad Request
    throw new Error("Ya has realizado la entrega para esta tarea.");
  }

  const submission = await Submission.create({
    assignment: assignmentId,
    student: studentId,
    content,
    fileUrl,
  });

  res.status(201).json(submission);
};

// @desc    Profesor obtiene todas las entregas de una tarea
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private/Professor
const getSubmissionsForAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const assignment = await Assignment.findById(assignmentId).populate(
    "section"
  );

  if (!assignment) {
    res.status(404);
    throw new Error("Tarea no encontrada.");
  }

  // Validación: ¿El profesor que hace la petición es el instructor de la sección?
  if (assignment.section.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("No estás autorizado para ver las entregas de esta tarea.");
  }

  const submissions = await Submission.find({
    assignment: assignmentId,
  }).populate("student", "name email");
  res.json(submissions);
};

// @desc    Profesor califica una entrega
// @route   PUT /api/submissions/:submissionId/grade
// @access  Private/Professor
const gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  const submission = await Submission.findById(submissionId).populate({
    path: "assignment",
    populate: { path: "section" },
  });

  if (!submission) {
    res.status(404);
    throw new Error("Entrega no encontrada.");
  }

  // Validación: ¿El profesor es el instructor de la sección correspondiente?
  if (
    submission.assignment.section.instructor.toString() !==
    req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("No estás autorizado para calificar esta entrega.");
  }

  submission.grade = grade;
  submission.feedback = feedback;
  const updatedSubmission = await submission.save();

  res.json(updatedSubmission);
};

module.exports = {
  createSubmission,
  getSubmissionsForAssignment,
  gradeSubmission,
};
