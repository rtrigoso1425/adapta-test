const mongoose = require("mongoose");

const lessonCompletionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    section: {
      // Guardamos la sección para el contexto
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  { timestamps: true }
);

lessonCompletionSchema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("LessonCompletion", lessonCompletionSchema);
