const mongoose = require('mongoose');

const evaluationSessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Module',
    },
    questionsAnswered: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    }],
    currentMastery: {
        type: Number,
        default: 25, // Empezamos con una maestría base
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress',
    },
    score: {
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('EvaluationSession', evaluationSessionSchema);