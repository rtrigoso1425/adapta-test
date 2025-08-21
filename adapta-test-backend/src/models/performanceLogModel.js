const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Question',
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Module',
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    difficulty: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);