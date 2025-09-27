const mongoose = require("mongoose");

const summativeAssessmentSchema = new mongoose.Schema({
  assignment: {
    // La tarea designada como examen (ej. Examen Final)
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  minGrade: {
    // La nota mínima requerida en esa tarea
    type: Number,
    required: true,
  },
});

const sectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    academicCycle: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AcademicCycle",
    },
    sectionCode: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    approvalCriteria: {
      // --- Pilar 1: Maestría por Tema ---
      mastery: {
        required: { type: Boolean, default: false },
        // Umbral de maestría (ej. 85) que se debe alcanzar en CADA módulo del curso.
        minPercentage: { type: Number, min: 1, max: 100 },
      },

      // --- Pilar 2: Evaluaciones Sumativas ---
      summativeAssessments: [summativeAssessmentSchema],

      // --- Pilar 3: Completitud y Participación ---
      completion: {
        // Porcentaje de lecciones que el estudiante debe haber marcado como "vistas".
        requiredLessonsPercentage: { type: Number, min: 1, max: 100 },
        // Si es 'true', el estudiante debe haber entregado TODAS las tareas de la sección.
        allAssignmentsRequired: { type: Boolean, default: false },
      },
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ sectionCode: 1, academicCycle: 1 }, { unique: true });

module.exports = mongoose.model("Section", sectionSchema);
