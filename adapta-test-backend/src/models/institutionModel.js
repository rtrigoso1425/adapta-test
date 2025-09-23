const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // Ej: "UTP", "SANMARTIN"
    type: {
        type: String,
        enum: ['university', 'high_school'],
        required: true
    },
    settings: {
        maxStudentsPerSection: { type: Number, default: 30 },
        allowParentAccess: { type: Boolean, default: false },
        gradingScale: { type: String, default: '0-20' },
        requiresPrerequisites: { type: Boolean, default: true }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);