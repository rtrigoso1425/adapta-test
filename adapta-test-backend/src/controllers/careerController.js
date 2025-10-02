const Career = require("../models/careerModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel"); // Importamos el modelo de Curso

// Middleware de ayuda para verificar si la institución es una universidad
// Lo definimos aquí para mantener la lógica encapsulada, pero podría moverse a un archivo de middleware.
const isUniversity = (req, res, next) => {
  if (req.institution.type !== "university") {
    return res.status(403).json({
      message:
        "Esta funcionalidad solo está disponible para instituciones de tipo universidad.",
    });
  }
  next();
};

// @desc    Crear una nueva carrera
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res) => {
  const { name, description, degrees, duration } = req.body;

  if (!name || !description || !degrees || !duration) {
    return res.status(400).json({
      message: "Nombre, descripción, grados y duración son requeridos.",
    });
  }

  const careerExists = await Career.findOne({
    name,
    institution: req.institution._id,
  });
  if (careerExists) {
    return res.status(400).json({
      message: "Una carrera con ese nombre ya existe en esta institución.",
    });
  }

  const career = await Career.create({
    name,
    description,
    degrees,
    duration,
    institution: req.institution._id,
  });
  res.status(201).json(career);
};

// @desc    Obtener todas las carreras
// @route   GET /api/careers
// @access  Private (para usuarios logueados)
const getCareers = async (req, res) => {
  const careers = await Career.find({
    institution: req.institution._id,
  }).populate("coordinator", "name email");
  res.json(careers);
};

// @desc    Asignar un coordinador a una carrera
// @route   PUT /api/careers/:id/coordinator
// @access  Private/Admin
const assignCoordinatorToCareer = async (req, res) => {
  const { userId } = req.body;

  // Todas las búsquedas deben ser dentro de la institución
  const career = await Career.findOne({
    _id: req.params.id,
    institution: req.institution._id,
  });
  const user = await User.findOne({
    _id: userId,
    institution: req.institution._id,
  });

  if (!career || !user) {
    return res.status(404).json({
      message: "Carrera o usuario no encontrado en esta institución.",
    });
  }

  if (user.role !== "coordinator") {
    return res.status(400).json({
      message: 'El usuario seleccionado no tiene el rol de "coordinator".',
    });
  }

  career.coordinator = userId;
  const savedCareer = await career.save();
  await savedCareer.populate("coordinator", "name email"); // Repoblar después de guardar
  res.json(savedCareer);
};

// @desc    Añadir un curso a un ciclo de la malla curricular
// @route   POST /api/careers/:id/curriculum
// @access  Private/Coordinator
const addCourseToCurriculum = async (req, res) => {
  const { courseId, cycleNumber } = req.body;

  const career = await Career.findOne({
    _id: req.params.id,
    institution: req.institution._id,
  });
  const courseToAdd = await Course.findOne({
    _id: courseId,
    institution: req.institution._id,
  });

  if (!career || !courseToAdd) {
    return res
      .status(404)
      .json({ message: "Carrera o curso no encontrado en esta institución." });
  }

  if (career.coordinator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "No tienes permisos para modificar esta malla curricular.",
    });
  }

  // VALIDACIÓN 1: El curso no puede estar ya en la malla curricular.
  const isCourseAlreadyInCurriculum = career.curriculum.some((cycle) =>
    cycle.courses.some((c) => c._id.toString() === courseId)
  );

  if (isCourseAlreadyInCurriculum) {
    res.status(400); // Bad Request
    throw new Error("Este curso ya ha sido añadido a la malla curricular.");
  }

  // VALIDACIÓN 2: El curso no puede estar en un ciclo anterior o igual al de sus prerrequisitos.
  if (courseToAdd.prerequisites && courseToAdd.prerequisites.length > 0) {
    let maxPrereqCycle = 0;

    // Buscamos el ciclo más alto en el que se encuentra un prerrequisito
    for (const prereqId of courseToAdd.prerequisites) {
      for (const cycle of career.curriculum) {
        if (
          cycle.courses.some((c) => c._id.toString() === prereqId.toString())
        ) {
          if (cycle.cycleNumber > maxPrereqCycle) {
            maxPrereqCycle = cycle.cycleNumber;
          }
        }
      }
    }

    // Si encontramos algún prerrequisito en la malla, validamos el ciclo.
    if (maxPrereqCycle > 0 && cycleNumber <= maxPrereqCycle) {
      res.status(400);
      throw new Error(
        `Este curso no puede ser añadido al ciclo ${cycleNumber} porque uno de sus prerrequisitos se encuentra en el ciclo ${maxPrereqCycle}.`
      );
    }
  }

  const cycleExists = career.curriculum.find(
    (c) => c.cycleNumber === cycleNumber
  );
  if (cycleExists) {
    cycleExists.courses.push(courseId);
  } else {
    career.curriculum.push({ cycleNumber, courses: [courseId] });
  }
  career.curriculum.sort((a, b) => a.cycleNumber - b.cycleNumber);

  await career.save();

  const updatedCareer = await Career.findOne({
    _id: career._id,
    institution: req.institution._id,
  })
    .populate("coordinator", "name email")
    .populate("curriculum.courses", "title description");

  res.json(updatedCareer);
};

// @desc    Obtener la carrera asignada al coordinador logueado
// @route   GET /api/careers/my-career
// @access  Private/Coordinator
const getMyCareer = async (req, res) => {
  const career = await Career.findOne({
    coordinator: req.user._id,
    institution: req.institution._id,
  }).populate("curriculum.courses", "title description");

  if (!career) {
    return res
      .status(404)
      .json({ message: "No tienes una carrera asignada en esta institución." });
  }
  res.json(career);
};

// @desc    Obtener una carrera por su ID
// @route   GET /api/careers/:id
// @access  Private
const getCareerById = async (req, res) => {
  const career = await Career.findOne({
    _id: req.params.id,
    institution: req.institution._id,
  })
    .populate("coordinator", "name email")
    .populate("curriculum.courses", "title description");

  if (career) {
    res.json(career);
  } else {
    res
      .status(404)
      .json({ message: "Carrera no encontrada en esta institución" });
  }
};

module.exports = {
  createCareer,
  getCareers,
  assignCoordinatorToCareer,
  addCourseToCurriculum,
  getMyCareer,
  getCareerById,
  isUniversity,
};
