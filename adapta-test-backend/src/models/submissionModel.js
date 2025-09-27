const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Assignment",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // El contenido puede ser texto o un enlace a un archivo
    content: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    grade: {
      type: Number,
    },
    feedback: {
      // Comentarios del profesor
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  { timestamps: true }
);

// Un estudiante solo puede hacer una entrega por tarea
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
