const mongoose = require("mongoose");

const institutionSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["university", "high_school"], required: true },
    // NUEVO: Vinculación con el Plan
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: false // Opcional al principio, o obligatorio si decides
    },
    settings: {
      maxStudentsPerSection: { type: Number, default: 30 },
      allowParentAccess: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);