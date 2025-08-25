const Section = require('../models/sectionModel');
const Course = require('../models/courseModel');
const AcademicCycle = require('../models/academicCycleModel');

// @desc    Crear una nueva sección para un curso
// @route   POST /api/courses/:courseId/sections
// @access  Private/Admin or Private/Coordinator
const createSection = async (req, res) => {
    const { instructor, academicCycle, sectionCode, capacity } = req.body;
    const { courseId } = req.params;

    // Verificar que el curso exista
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
        res.status(404);
        throw new Error('Curso no encontrado.');
    }

    const section = await Section.create({
        course: courseId,
        instructor,
        academicCycle,
        sectionCode,
        capacity,
    });

    res.status(201).json(section);
};

// @desc    Obtener todas las secciones de un curso (MEJORADO)
// @route   GET /api/courses/:courseId/sections
// @access  Private
const getSectionsForCourse = async (req, res) => {
    const { courseId } = req.params;
    
    const activeCycle = await AcademicCycle.findOne({ isActive: true });
    if (!activeCycle) {
        // Si no hay ciclo activo, no hay secciones que mostrar
        return res.json([]);
    }

    const sections = await Section.find({ 
        course: courseId, 
        academicCycle: activeCycle._id 
    }).populate('instructor', 'name');
    
    res.json(sections);
};

// @desc    Obtener las secciones asignadas a un instructor
// @route   GET /api/sections/my-sections
// @access  Private/Professor
const getMySections = async (req, res) => {
    const sections = await Section.find({ instructor: req.user._id })
        .populate('course', 'title') // Del curso, trae el título
        .populate('academicCycle', 'name'); // Del ciclo, trae el nombre

    res.json(sections);
};

// @desc    Obtener una sección por su ID
// @route   GET /api/sections/:id
// @access  Private
const getSectionById = async (req, res) => {
    // 👇 CAMBIO: Le pedimos que popule el 'title', 'description' y 'syllabus' del curso.
    const section = await Section.findById(req.params.id)
        .populate('course', 'title description syllabus') // <-- LÍNEA MODIFICADA
        .populate('instructor', 'name');

    if (section) {
        res.json(section);
    } else {
        res.status(404);
        throw new Error('Sección no encontrada');
    }
};

// @desc    Actualizar los criterios de aprobación de una sección
// @route   PUT /api/sections/:id/criteria
// @access  Private/Professor or Private/Coordinator
const updateApprovalCriteria = async (req, res) => {
    const section = await Section.findById(req.params.id);

    if (!section) {
        res.status(404);
        throw new Error('Sección no encontrada.');
    }

    // Validación de permisos: Solo el instructor de la sección puede cambiar los criterios.
    // (Asumimos que el coordinador también podría, pero por ahora nos centramos en el instructor)
    if (section.instructor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('No autorizado para modificar esta sección.');
    }

    // Actualizamos el objeto 'approvalCriteria' con los datos que lleguen en el body
    section.approvalCriteria = {
        ...section.approvalCriteria,
        ...req.body
    };
    
    const updatedSection = await section.save();
    res.json(updatedSection);
};


module.exports = { createSection, getSectionsForCourse, getMySections, getSectionById, updateApprovalCriteria };