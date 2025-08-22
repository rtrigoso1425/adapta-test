const AcademicRecord = require("../models/academicRecordModel");
const Enrollment = require("../models/enrollmentModel");
const AcademicCycle = require("../models/academicCycleModel"); // <-- 1. Importar
const Section = require("../models/sectionModel"); // <-- 1. Importar

// @desc    Obtener el progreso académico completo del estudiante logueado
// @route   GET /api/progress/my-progress
// @access  Private/Student
const getMyAcademicProgress = async (req, res) => {
  const studentId = req.user._id;

  // 1. Encontrar el expediente del estudiante y poblar la malla curricular completa
  const record = await AcademicRecord.findOne({ student: studentId }).populate({
    path: "career",
    populate: {
      path: "curriculum.courses",
      model: "Course",
    },
  });

  if (!record) {
    // Si no tiene expediente, significa que aún no se ha inscrito en una carrera
    return res.json({ needsCareerEnrollment: true });
  }

  // 2. Obtener todos los cursos que el estudiante ha APROBADO
  const passedEnrollments = await Enrollment.find({
    student: studentId,
    status: "passed",
  }).populate({ path: "section", select: "course" });
  const passedCourseIds = passedEnrollments.map((e) =>
    e.section.course.toString()
  );

  let currentEnrollments = [];
  const activeCycle = await AcademicCycle.findOne({ isActive: true });

  if (activeCycle) {
    // Encontrar todas las secciones que pertenecen al ciclo activo
    const sectionsInActiveCycle = await Section.find({
      academicCycle: activeCycle._id,
    });
    const sectionIds = sectionsInActiveCycle.map((s) => s._id);

    // Buscar las matrículas del estudiante que estén en esas secciones
    currentEnrollments = await Enrollment.find({
      student: studentId,
      section: { $in: sectionIds },
      status: "enrolled", // Solo las que están en curso
    }).populate({
      path: "section",
      populate: { path: "course", select: "title description" },
    });
  }

  // 3. Calcular el ciclo relativo del estudiante
  let currentCycle = 0;
  if (record.career.curriculum) {
    record.career.curriculum.forEach((cycle) => {
      const allCoursesInCyclePassed = cycle.courses.every((course) =>
        passedCourseIds.includes(course._id.toString())
      );
      if (allCoursesInCyclePassed) {
        currentCycle = Math.max(currentCycle, cycle.cycleNumber);
      }
    });
  }
  // El estudiante puede llevar cursos de su ciclo actual + 1 (adelantar)
  const accessibleCycle = currentCycle + 1;

  // 4. Determinar los cursos elegibles para la matrícula
  const eligibleCourses = [];
  if (record.career.curriculum) {
    record.career.curriculum.forEach((cycle) => {
      // Un curso es elegible si pertenece a un ciclo accesible
      if (cycle.cycleNumber <= accessibleCycle) {
        cycle.courses.forEach((course) => {
          const courseId = course._id.toString();

          // Y si no ha sido aprobado ya
          if (!passedCourseIds.includes(courseId)) {
            // Y si cumple con los prerrequisitos
            const prerequisites = course.prerequisites || [];
            const hasMetPrerequisites = prerequisites.every((prereqId) =>
              passedCourseIds.includes(prereqId.toString())
            );

            if (hasMetPrerequisites) {
              eligibleCourses.push(course);
            }
          }
        });
      }
    });
  }

  res.json({
    needsCareerEnrollment: false,
    career: record.career,
    currentCycle: accessibleCycle,
    passedCourseIds,
    eligibleCourses,
    currentEnrollments,
  });
};

module.exports = { getMyAcademicProgress };
