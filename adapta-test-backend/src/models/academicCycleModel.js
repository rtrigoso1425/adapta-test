const mongoose = require('mongoose');

const academicCycleSchema = new mongoose.Schema({
    name: { // ej: "2026-I", "Verano 2027"
        type: String,
        required: true,
        unique: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: { // Para saber cuál es el ciclo actual
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('AcademicCycle', academicCycleSchema);