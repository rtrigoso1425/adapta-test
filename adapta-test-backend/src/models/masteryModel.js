const mongoose = require("mongoose");

const masterySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    // Almacenamos el nivel más alto de maestría que el estudiante ha alcanzado en este módulo
    highestMasteryScore: {
      type: Number,
      default: 0,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  { timestamps: true }
);

// Un estudiante solo puede tener un registro de maestría por módulo
masterySchema.index({ student: 1, module: 1 }, { unique: true });

module.exports = mongoose.model("Mastery", masterySchema);
