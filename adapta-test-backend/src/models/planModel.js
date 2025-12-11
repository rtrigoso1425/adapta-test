const mongoose = require("mongoose");

const planSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // Ej: "Plan Universitario Pro"
    code: { type: String, required: true, unique: true, uppercase: true }, // Ej: "UNI_PRO"
    price: { type: Number, required: true, default: 0 },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    features: [{ type: String }], // Array de strings para listar beneficios
    limits: {
      maxStudents: { type: Number, default: 100 },
      maxStorageGB: { type: Number, default: 5 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);