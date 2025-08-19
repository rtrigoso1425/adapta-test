const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // CAMBIO CLAVE: El vínculo ahora es con la Sección
    section: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Section',
    },
    status: {
        type: String,
        enum: ['enrolled', 'in_progress', 'completed', 'failed'],
        default: 'enrolled',
    },
}, { timestamps: true });

// El índice único ahora previene que un estudiante se matricule dos veces en la misma sección
enrollmentSchema.index({ student: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);