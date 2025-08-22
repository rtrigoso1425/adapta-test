const AcademicRecord = require('../models/academicRecordModel');
const Career = require('../models/careerModel');

// @desc    Estudiante se inscribe en una carrera
// @route   POST /api/academic-records/enroll
// @access  Private/Student
const enrollInCareer = async (req, res) => {
    const { careerId } = req.body;
    const studentId = req.user._id;

    const careerExists = await Career.findById(careerId);
    if (!careerExists) {
        res.status(404);
        throw new Error('La carrera seleccionada no existe.');
    }

    const recordExists = await AcademicRecord.findOne({ student: studentId });
    if (recordExists) {
        res.status(400);
        throw new Error('Ya te encuentras inscrito en una carrera.');
    }

    const academicRecord = await AcademicRecord.create({
        student: studentId,
        career: careerId,
    });

    res.status(201).json(academicRecord);
};

module.exports = { enrollInCareer };