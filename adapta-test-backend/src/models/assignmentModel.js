const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Section",
    },
    title: {
      type: String,
      required: [true, "El título de la tarea es obligatorio."],
    },
    instructions: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
    },
    pointsPossible: {
      type: Number,
      default: 100,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
