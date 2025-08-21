const Career = require('../models/careerModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel'); // Importamos el modelo de Curso

// @desc    Crear una nueva carrera
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res) => {
    // ... (esta función se mantiene igual que antes)
    const { name, description } = req.body;

    if (!name || !description) {
        res.status(400);
        throw new Error('Por favor, proporciona un nombre y una descripción.');
    }

    const careerExists = await Career.findOne({ name });
    if (careerExists) {
        res.status(400);
        throw new Error('Una carrera con ese nombre ya existe.');
    }

    const career = await Career.create({
        name,
        description,
    });

    res.status(201).json(career);
};

// @desc    Obtener todas las carreras
// @route   GET /api/careers
// @access  Private (para usuarios logueados)
const getCareers = async (req, res) => {
    // ... (esta función se mantiene igual que antes)
    const careers = await Career.find({}).populate('coordinator', 'name email');
    res.json(careers);
};

// ===============================================================
// 👇 FUNCIÓN NUEVA: ASIGNAR UN COORDINADOR A UNA CARRERA
// ===============================================================
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
        throw new Error('Carrera o usuario no encontrado.');
    }

    if (user.role !== 'coordinator') {
        res.status(400);
        throw new Error('El usuario seleccionado no tiene el rol de "coordinator".');
    }

    career.coordinator = userId;
    const updatedCareer = await career.save();

    res.json(updatedCareer);
};

// ===============================================================
// 👇 FUNCIÓN NUEVA: AÑADIR UN CURSO A LA MALLA CURRICULAR
// ===============================================================
// @desc    Añadir un curso a un ciclo de la malla curricular
// @route   POST /api/careers/:id/curriculum
// @access  Private/Coordinator
const addCourseToCurriculum = async (req, res) => {
    const { courseId, cycleNumber } = req.body;
    const { id: careerId } = req.params;

    const career = await Career.findById(careerId);
    const course = await Course.findById(courseId);

    if (!career || !course) {
        res.status(404);
        throw new Error('Carrera o curso no encontrado.');
    }

    // Validación de permisos: Solo el coordinador asignado puede modificar la malla
    if (career.coordinator.toString() !== req.user._id.toString()) {
        res.status(403); // Prohibido
        throw new Error('No tienes permisos para modificar esta malla curricular.');
    }

    const cycleExists = career.curriculum.find(c => c.cycleNumber === cycleNumber);

    if (cycleExists) {
        // Si el ciclo ya existe, solo añadimos el curso si no está ya incluido
        if (!cycleExists.courses.includes(courseId)) {
            cycleExists.courses.push(courseId);
        }
    } else {
        // Si el ciclo no existe, lo creamos y añadimos el curso
        career.curriculum.push({ cycleNumber, courses: [courseId] });
    }
    
    // Ordenamos la malla por número de ciclo para mantener la consistencia
    career.curriculum.sort((a, b) => a.cycleNumber - b.cycleNumber);

    const updatedCareer = await career.save();
    res.json(updatedCareer);
};


module.exports = {
    createCareer,
    getCareers,
    assignCoordinatorToCareer,
    addCourseToCurriculum,    
};