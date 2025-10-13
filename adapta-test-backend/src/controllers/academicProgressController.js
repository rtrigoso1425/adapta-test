// src/controllers/academicProgressController.js
const AcademicRecord = require("../models/academicRecordModel");
const Enrollment = require("../models/enrollmentModel");
const AcademicCycle = require("../models/academicCycleModel");
const Section = require("../models/sectionModel");

// @desc    Obtener el progreso académico completo del estudiante logueado
// @route   GET /api/progress/my-progress
// @access  Private/Student
const getMyAcademicProgress = async (req, res) => {
  const studentId = req.user._id;
  const institutionId = req.institution._id;

  // 1. Buscar expediente del estudiante EN SU INSTITUCIÓN
  const record = await AcademicRecord.findOne({
    student: studentId,
    institution: institutionId,
  }).populate({
    path: "career",
    populate: {
      path: "curriculum.courses",
      model: "Course",
    },
  });

  if (!record) {
    return res.json({ needsCareerEnrollment: true });
  }

  // 2. Obtener cursos aprobados del estudiante EN SU INSTITUCIÓN
  const passedEnrollments = await Enrollment.find({
    student: studentId,
    status: "passed",
    institution: institutionId,
  }).populate({ path: "section", select: "course" });
  const passedCourseIds = passedEnrollments.map((e) =>
    e.section.course.toString()
  );

  // 3. Obtener matrículas actuales del estudiante EN SU INSTITUCIÓN
  let currentEnrollments = [];
  const activeCycle = await AcademicCycle.findOne({
    isActive: true,
    institution: institutionId,
  });

  if (activeCycle) {
    const sectionsInActiveCycle = await Section.find({
      academicCycle: activeCycle._id,
      institution: institutionId,
    });
    const sectionIds = sectionsInActiveCycle.map((s) => s._id);

    currentEnrollments = await Enrollment.find({
      student: studentId,
      section: { $in: sectionIds },
      status: "enrolled",
      institution: institutionId,
    }).populate({
      path: "section",
      populate: { path: "course", select: "title description" },
    });
  }

  // 4. Calcular el ciclo relativo y los cursos elegibles (la lógica interna no cambia)
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
  const accessibleCycle = currentCycle + 1;

  const eligibleCourses = [];
  if (record.career.curriculum) {
    record.career.curriculum.forEach((cycle) => {
      if (cycle.cycleNumber <= accessibleCycle) {
        cycle.courses.forEach((course) => {
          const courseId = course._id.toString();
          if (!passedCourseIds.includes(courseId)) {
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
