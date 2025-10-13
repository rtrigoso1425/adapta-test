// src/controllers/parentController.js
const User = require("../models/userModel");
const Enrollment = require("../models/enrollmentModel");
const Mastery = require("../models/masteryModel");

// @desc    Un padre obtiene el progreso de sus hijos asignados
// @route   GET /api/parents/my-children
// @access  Private/Parent
const getMyChildrenProgress = async (req, res, next) => {
  try {
    // Doble validación: el rol del usuario debe ser 'parent' y la institución debe permitirlo
    if (req.user.role !== "parent" || req.institution.type !== "high_school") {
      return res
        .status(403)
        .json({
          message: "Acceso no autorizado para este rol o tipo de institución.",
        });
    }

    if (!req.user.parentOf || req.user.parentOf.length === 0) {
      return res.json([]); // El padre no tiene hijos asignados
    }

    // Buscamos los datos de los hijos que están en la lista `parentOf` del padre
    const children = await User.find({
      _id: { $in: req.user.parentOf },
      institution: req.institution._id,
    }).select("name email studentGrade");

    const progressData = [];

    // Iteramos para obtener los datos de cada hijo
    for (const child of children) {
      // Obtener matrículas actuales en el ciclo activo
      const enrollments = await Enrollment.find({
        student: child._id,
        status: "enrolled",
        institution: req.institution._id,
      }).populate({
        path: "section",
        populate: { path: "course", select: "title" },
      });

      // Obtener un resumen de la maestría
      const masteryLevels = await Mastery.find({
        student: child._id,
        institution: req.institution._id,
      }).populate("module", "title");

      progressData.push({
        student: child,
        enrollments,
        masteryLevels,
      });
    }

    res.json(progressData);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyChildrenProgress };
