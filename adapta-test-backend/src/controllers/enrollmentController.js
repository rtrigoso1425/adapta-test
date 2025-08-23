const Enrollment = require("../models/enrollmentModel");
const Section = require("../models/sectionModel");
const Course = require("../models/courseModel");

// @desc    Estudiante se matricula automáticamente en una sección
// @route   POST /api/enrollments/enroll
// @access  Private/Student
const enrollStudent = async (req, res) => {
  const { sectionId } = req.body;
  const studentId = req.user._id;

  // --- 1. Obtener datos necesarios ---
  const section = await Section.findById(sectionId).populate("course");
  if (!section) {
    res.status(404);
    throw new Error("Sección no encontrada.");
  }
  const course = section.course;

  // --- 2. Ejecutar Validaciones ---

  // Validación A: ¿Ya está matriculado?
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    section: sectionId,
  });
  if (existingEnrollment) {
    res.status(400);
    throw new Error("Ya te encuentras matriculado en esta sección.");
  }

  // Validación B: ¿Hay capacidad disponible?
  const enrolledCount = await Enrollment.countDocuments({ section: sectionId });
  if (enrolledCount >= section.capacity) {
    res.status(400);
    throw new Error(
      "La sección ha alcanzado su capacidad máxima. No hay vacantes."
    );
  }

  // Validación C: ¿Cumple con los prerrequisitos?
  if (course.prerequisites && course.prerequisites.length > 0) {
    // Obtener las matrículas aprobadas del estudiante
    const studentEnrollments = await Enrollment.find({
      student: studentId,
      status: "enrolled",
    }).populate({
      path: "section",
      select: "course",
    });

    // Extraer los IDs de los cursos que el estudiante está llevando (o ha completado)
    const studentCoursesIds = studentEnrollments.map((e) =>
      e.section.course.toString()
    );

    for (const prereqId of course.prerequisites) {
      if (!studentCoursesIds.includes(prereqId.toString())) {
        const prereqCourse = await Course.findById(prereqId);
        res.status(400);
        throw new Error(
          `No cumples con los prerrequisitos. Debes haber aprobado el curso: "${prereqCourse.title}".`
        );
      }
    }
  }

  // --- 3. Crear Matrícula ---
  // Si todas las validaciones pasan, se crea la matrícula directamente como 'enrolled'.
  const enrollment = await Enrollment.create({
    student: studentId,
    section: sectionId,
    // status por defecto será 'enrolled'
  });

  res.status(201).json({ message: "¡Matrícula exitosa!", enrollment });
};

// @desc    Estudiante obtiene sus matrículas
// @route   GET /api/enrollments/my-enrollments
// @access  Private/Student
const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate(
    {
      path: "section",
      populate: [
        { path: "course", select: "title" },
        { path: "instructor", select: "name" },
      ],
    }
  );
  res.json(enrollments);
};

// @desc    Estudiante obtiene su historial académico agrupado por ciclo
// @route   GET /api/enrollments/my-history
// @access  Private/Student
const getMyEnrollmentHistory = async (req, res) => {
  // 1. Obtener todas las matrículas del estudiante, populando toda la info necesaria
  const allEnrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "section",
      populate: [
        { path: "course", select: "title" },
        { path: "instructor", select: "name" },
        { path: "academicCycle", select: "name isActive" }, // ¡Importante poblar el ciclo aquí!
      ],
    })
    .sort({ "section.academicCycle.startDate": -1 }); // Ordenar por fecha de inicio del ciclo

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
        enrollments: [],
      };
    }
    acc[cycleId].enrollments.push(enrollment);
    return acc;
  }, {});

  // 3. Convertir el objeto en un array para enviarlo
  const history = Object.values(groupedByCycle);

  res.json(history);
};

// @desc    Estudiante se matricula en un lote de secciones (carrito)
// @route   POST /api/enrollments/enroll-batch
// @access  Private/Student
const enrollInBatch = async (req, res) => {
  const { sectionIds } = req.body; // Recibimos un array de IDs de sección
  const studentId = req.user._id;

  if (!sectionIds || sectionIds.length === 0) {
    res.status(400);
    throw new Error("No se han proporcionado secciones para la matrícula.");
  }

  // --- FASE DE VALIDACIÓN PREVIA ---
  const validationResults = [];
  for (const sectionId of sectionIds) {
    const section = await Section.findById(sectionId).populate("course");
    if (!section) {
      validationResults.push(
        `La sección con ID ${sectionId} no fue encontrada.`
      );
      continue;
    }

    // Validación A: Capacidad
    const enrolledCount = await Enrollment.countDocuments({
      section: sectionId,
    });
    if (enrolledCount >= section.capacity) {
      validationResults.push(
        `El curso "${section.course.title}" no tiene vacantes.`
      );
      continue;
    }

    // Validación B: Prerrequisitos (la misma lógica que ya teníamos)
    const course = section.course;
    if (course.prerequisites && course.prerequisites.length > 0) {
      const studentEnrollments = await Enrollment.find({
        student: studentId,
        status: { $in: ["enrolled", "passed"] },
      }).populate({ path: "section", select: "course" });
      const studentCoursesIds = studentEnrollments.map((e) =>
        e.section.course.toString()
      );
      for (const prereqId of course.prerequisites) {
        if (!studentCoursesIds.includes(prereqId.toString())) {
          validationResults.push(
            `No cumples los prerrequisitos para el curso "${course.title}".`
          );
          break; // No es necesario seguir revisando prerrequisitos para este curso
        }
      }
    }
  }

  // Si hubo algún error de validación, detenemos todo el proceso.
  if (validationResults.length > 0) {
    res.status(400);
    throw new Error(
      `No se pudo completar la matrícula debido a los siguientes errores: \n- ${validationResults.join(
        "\n- "
      )}`
    );
  }

  // --- FASE DE CREACIÓN ---
  const enrollmentPromises = sectionIds.map((sectionId) => {
    return Enrollment.create({ student: studentId, section: sectionId });
  });

  const enrollments = await Promise.all(enrollmentPromises);

  res
    .status(201)
    .json({ message: "¡Matrícula completada exitosamente!", enrollments });
};

module.exports = {
  enrollStudent,
  getMyEnrollments,
  getMyEnrollmentHistory,
  enrollInBatch,
};
