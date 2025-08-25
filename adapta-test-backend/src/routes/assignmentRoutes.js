const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createAssignment,
  getAssignmentsForSection,
} = require("../controllers/assignmentController");
const {
  createSubmission,
  getSubmissionsForAssignment,
  getMySubmissionForAssignment
} = require("../controllers/submissionController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("professor"), createAssignment)
  .get(protect, getAssignmentsForSection);

// Un estudiante entrega una tarea
// POST /api/sections/:sectionId/assignments/:assignmentId/submit
router
  .route("/:assignmentId/submit")
  .post(protect, authorize("student"), createSubmission);

// Un profesor ve todas las entregas de una tarea
// GET /api/sections/:sectionId/assignments/:assignmentId/submissions
router
  .route("/:assignmentId/submissions")
  .get(protect, authorize("professor"), getSubmissionsForAssignment);

// Estudiante obtiene su entrega para una tarea
router
  .route("/:assignmentId/mysubmission")
  .get(protect, authorize("student"), getMySubmissionForAssignment);

module.exports = router;
