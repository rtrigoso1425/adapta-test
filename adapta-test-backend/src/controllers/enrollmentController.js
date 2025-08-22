const Enrollment = require('../models/enrollmentModel');
const Section = require('../models/sectionModel');
const Course = require('../models/courseModel');

// @desc    Estudiante se matricula automáticamente en una sección
// @route   POST /api/enrollments/enroll
// @access  Private/Student
const enrollStudent = async (req, res) => {
    const { sectionId } = req.body;
    const studentId = req.user._id;

    // --- 1. Obtener datos necesarios ---
    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
        res.status(404);
        throw new Error('Sección no encontrada.');
    }
    const course = section.course;

    // --- 2. Ejecutar Validaciones ---

    // Validación A: ¿Ya está matriculado?
    const existingEnrollment = await Enrollment.findOne({ student: studentId, section: sectionId });
    if (existingEnrollment) {
        res.status(400);
        throw new Error('Ya te encuentras matriculado en esta sección.');
    }

    // Validación B: ¿Hay capacidad disponible?
    const enrolledCount = await Enrollment.countDocuments({ section: sectionId });
    if (enrolledCount >= section.capacity) {
        res.status(400);
        throw new Error('La sección ha alcanzado su capacidad máxima. No hay vacantes.');
    }

    // Validación C: ¿Cumple con los prerrequisitos?
    if (course.prerequisites && course.prerequisites.length > 0) {
        // Obtener las matrículas aprobadas del estudiante
        const studentEnrollments = await Enrollment.find({ student: studentId, status: 'enrolled' }).populate({
            path: 'section',
            select: 'course'
        });
        
        // Extraer los IDs de los cursos que el estudiante está llevando (o ha completado)
        const studentCoursesIds = studentEnrollments.map(e => e.section.course.toString());

        for (const prereqId of course.prerequisites) {
            if (!studentCoursesIds.includes(prereqId.toString())) {
                const prereqCourse = await Course.findById(prereqId);
                res.status(400);
                throw new Error(`No cumples con los prerrequisitos. Debes haber aprobado el curso: "${prereqCourse.title}".`);
            }
        }
    }

    // --- 3. Crear Matrícula ---
    // Si todas las validaciones pasan, se crea la matrícula directamente como 'enrolled'.
    const enrollment = await Enrollment.create({ 
        student: studentId, 
        section: sectionId 
        // status por defecto será 'enrolled'
    });
    
    res.status(201).json({ message: '¡Matrícula exitosa!', enrollment });
};

// @desc    Estudiante obtiene sus matrículas
// @route   GET /api/enrollments/my-enrollments
// @access  Private/Student
const getMyEnrollments = async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id })
        .populate({
            path: 'section',
            populate: [
                { path: 'course', select: 'title' },
                { path: 'instructor', select: 'name' }
            ]
        });
    res.json(enrollments);
};

// @desc    Estudiante obtiene su historial académico agrupado por ciclo
// @route   GET /api/enrollments/my-history
// @access  Private/Student
const getMyEnrollmentHistory = async (req, res) => {
    // 1. Obtener todas las matrículas del estudiante, populando toda la info necesaria
    const allEnrollments = await Enrollment.find({ student: req.user._id })
        .populate({
            path: 'section',
            populate: [
                { path: 'course', select: 'title' },
                { path: 'instructor', select: 'name' },
                { path: 'academicCycle', select: 'name isActive' } // ¡Importante poblar el ciclo aquí!
            ]
        })
        .sort({ 'section.academicCycle.startDate': -1 }); // Ordenar por fecha de inicio del ciclo

    // 2. Agrupar las matrículas por ciclo académico
    const groupedByCycle = allEnrollments.reduce((acc, enrollment) => {
        const cycle = enrollment.section.academicCycle;
        if (!cycle) return acc; // Omitir si no hay ciclo

        const cycleId = cycle._id.toString();
        if (!acc[cycleId]) {
            acc[cycleId] = {
                cycleId: cycleId,
                cycleName: cycle.name,
                isActive: cycle.isActive,
                enrollments: []
            };
        }
        acc[cycleId].enrollments.push(enrollment);
        return acc;
    }, {});

    // 3. Convertir el objeto en un array para enviarlo
    const history = Object.values(groupedByCycle);
    
    res.json(history);
};


module.exports = { 
    enrollStudent,
    getMyEnrollments,
    getMyEnrollmentHistory
};