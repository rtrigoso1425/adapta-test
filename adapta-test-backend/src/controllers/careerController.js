const Career = require("../models/careerModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel"); // Importamos el modelo de Curso

// @desc    Crear una nueva carrera
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res) => {
  const { name, description, degrees, duration } = req.body;

  if (!name || !description || !degrees || !duration) {
    res.status(400);
    throw new Error(
      "Por favor, completa todos los campos: nombre, descripción, grados y duración."
    );
  }

  const careerExists = await Career.findOne({ name });
  if (careerExists) {
    res.status(400);
    throw new Error("Una carrera con ese nombre ya existe.");
  }

  const career = await Career.create({
    name,
    description,
    degrees, // <-- 3. Añadir al objeto de creación
    duration, // <-- 3. Añadir al objeto de creación
  });

  res.status(201).json(career);
};

// @desc    Obtener todas las carreras
// @route   GET /api/careers
// @access  Private (para usuarios logueados)
const getCareers = async (req, res) => {
  // ... (esta función se mantiene igual que antes)
  const careers = await Career.find({}).populate("coordinator", "name email");
  res.json(careers);
};

// @desc    Asignar un coordinador a una carrera
// @route   PUT /api/careers/:id/coordinator
// @access  Private/Admin
const assignCoordinatorToCareer = async (req, res) => {
  const { userId } = req.body;
  const { id: careerId } = req.params;

  const career = await Career.findById(careerId);
  const user = await User.findById(userId);

  if (!career || !user) {
    res.status(404);
    throw new Error("Carrera o usuario no encontrado.");
  }

  if (user.role !== "coordinator") {
    res.status(400);
    throw new Error(
      'El usuario seleccionado no tiene el rol de "coordinator".'
    );
  }

  career.coordinator = userId;
  await career.save(); // Guardamos el cambio

  // 👇 ANTES DE ENVIAR LA RESPUESTA, LA POBLAMOS
  const updatedCareer = await Career.findById(career._id).populate(
    "coordinator",
    "name email"
  );

  res.json(updatedCareer);
};


// @desc    Añadir un curso a un ciclo de la malla curricular
// @route   POST /api/careers/:id/curriculum
// @access  Private/Coordinator
const addCourseToCurriculum = async (req, res) => {
  const { courseId, cycleNumber } = req.body;
  const { id: careerId } = req.params;

  const career = await Career.findById(careerId).populate("curriculum.courses"); // Populamos para acceder a los prerrequisitos
  const courseToAdd = await Course.findById(courseId);

  if (!career || !courseToAdd) {
    res.status(404);
    throw new Error("Carrera o curso no encontrado.");
  }

  if (career.coordinator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("No tienes permisos para modificar esta malla curricular.");
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

  const updatedCareer = await Career.findById(career._id)
    .populate("coordinator", "name email")
    .populate("curriculum.courses", "title description");

  res.json(updatedCareer);
};

// @desc    Obtener la carrera asignada al coordinador logueado
// @route   GET /api/careers/my-career
// @access  Private/Coordinator
const getMyCareer = async (req, res) => {
  // Buscamos la carrera donde el campo 'coordinator' coincida con el ID del usuario logueado
  const career = await Career.findOne({ coordinator: req.user._id }).populate(
    "curriculum.courses",
    "title description"
  );

  if (!career) {
    res.status(404);
    throw new Error(
      "No tienes una carrera asignada o la carrera no fue encontrada."
    );
  }

  res.json(career);
};

// @desc    Obtener una carrera por su ID
// @route   GET /api/careers/:id
// @access  Private
const getCareerById = async (req, res) => {
  const career = await Career.findById(req.params.id)
    .populate("coordinator", "name email")
    .populate("curriculum.courses", "title description");

  if (career) {
    res.json(career);
  } else {
    res.status(404);
    throw new Error("Carrera no encontrada");
  }
};

module.exports = {
  createCareer,
  getCareers,
  assignCoordinatorToCareer,
  addCourseToCurriculum,
  getMyCareer,
  getCareerById,
};
