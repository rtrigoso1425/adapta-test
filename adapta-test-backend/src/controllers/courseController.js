const Course = require("../models/courseModel");
const upload = require("../config/upload");
const InstitutionRulesService = require("../services/institutionRulesService");

// @desc    Crear un nuevo curso
// @route   POST /api/courses
// @access  Private/Admin or Private/Coordinator
const createCourse = async (req, res) => {
  const { title, description, prerequisites, targetGrade } = req.body;
  const rules = InstitutionRulesService.getRulesForInstitution(req.institution);

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Título y descripción son requeridos." });
  }

  // Aplicar regla sobre prerrequisitos
  if (!rules.hasPrerequisites && prerequisites && prerequisites.length > 0) {
    return res.status(400).json({
      message: `Esta institución (${req.institution.type}) no permite el uso de prerrequisitos.`,
    });
  }

  const course = await Course.create({
    title,
    description,
    prerequisites: rules.hasPrerequisites ? prerequisites || [] : [],
    institution: req.institution._id,
    targetGrade:
      req.institution.type === "high_school" ? targetGrade : undefined,
  });

  res.status(201).json(course);
};

// @desc    Obtener todos los cursos
// @route   GET /api/courses
// @access  Private (para cualquier usuario logueado)
const getCourses = async (req, res) => {
  const courses = await Course.find({ institution: req.institution._id });
  res.json(courses);
};

// @desc    Obtener un curso por su ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    institution: req.institution._id,
  });
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ message: "Curso no encontrado" });
  }
};

// @desc    Subir un sílabus para un curso
// @route   POST /api/courses/:courseId/upload-syllabus
// @access  Private/Coordinator
const uploadSyllabus = async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    institution: req.institution._id,
  });

  if (!course) {
    return res.status(404).json({ message: "Curso no encontrado" });
  }

  if (req.file) {
    course.syllabus = `/${req.file.path.replace(/\\/g, "/")}`;
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } else {
    res.status(400).json({ message: "Por favor, sube un archivo PDF válido." });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  uploadSyllabus,
};
