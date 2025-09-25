
const InstitutionRulesService = require("../services/institutionRulesService");
const Course = require("../models/courseModel"); // Necesario para buscar el curso

const validateInstitutionAction = (action) => {
  return async (req, res, next) => {
    // Asumimos que el middleware `protect` ya se ejecutó y pobló `req.institution` y `req.user`
    if (!req.institution || !req.user) {
      return res
        .status(401)
        .json({ message: "Acceso no autorizado. Se requiere autenticación." });
    }

    const institution = req.institution;
    const user = req.user;
    const rules = InstitutionRulesService.getRulesForInstitution(institution);

    try {
      switch (action) {
        case "create_course_with_prerequisites":
          if (
            !rules.hasPrerequisites &&
            req.body.prerequisites &&
            req.body.prerequisites.length > 0
          ) {
            return res.status(400).json({
              message: `La configuración de esta institución (${institution.type}) no permite el uso de prerrequisitos.`,
            });
          }
          break;

        case "enroll_student":
          // Para esta acción, primero necesitamos cargar el curso
          const courseId = req.body.courseId || req.params.courseId; // Puede venir del body o params
          const course = await Course.findById(courseId);
          if (!course) {
            return res
              .status(404)
              .json({
                message: "El curso para la matrícula no fue encontrado.",
              });
          }

          const canEnroll = await InstitutionRulesService.canEnrollInCourse(
            user,
            course,
            institution
          );
          if (!canEnroll) {
            return res.status(403).json({
              message:
                "No cumples los requisitos de inscripción para este curso.",
            });
          }
          break;

        case "access_parent_data":
          if (
            user.role !== "parent" ||
            !rules.allowedRoles.includes("parent")
          ) {
            return res.status(403).json({
              message:
                "El acceso para padres no está habilitado en esta institución.",
            });
          }
          break;

        // Puedes añadir más casos de validación aquí en el futuro
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { validateInstitutionAction };
