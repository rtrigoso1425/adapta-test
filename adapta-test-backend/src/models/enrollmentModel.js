const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Section",
    },
    status: {
      type: String,
      enum: ["enrolled", "passed", "failed", "withdrawn"],
      default: "enrolled",
    },
    finalGrade: {
      type: Number,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
