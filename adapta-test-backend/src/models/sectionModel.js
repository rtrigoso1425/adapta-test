const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    academicCycle: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'AcademicCycle',
    },
    sectionCode: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
}, { timestamps: true });

sectionSchema.index({ sectionCode: 1, academicCycle: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);