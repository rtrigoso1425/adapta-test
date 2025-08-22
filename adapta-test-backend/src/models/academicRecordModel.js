const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    career: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'graduated', 'withdrawn'],
        default: 'active',
    },
}, { timestamps: true });

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);