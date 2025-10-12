const Module = require("../models/moduleModel");
const Section = require("../models/sectionModel");

// @desc    Crear un nuevo módulo en la biblioteca personal del profesor
// @route   POST /api/modules
// @access  Private/Professor
const createModuleInLibrary = async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400);
    throw new Error("El título es obligatorio.");
  }

  const module = await Module.create({
    title,
    description,
    owner: req.user._id, // El dueño es el profesor logueado
    institution: req.institution._id, // ASIGNAR INSTITUCIÓN
  });
  res.status(201).json(module);
};

// @desc    Obtener los módulos de la biblioteca del profesor logueado
// @route   GET /api/modules/my-library
// @access  Private/Professor
const getMyLibraryModules = async (req, res) => {
  // Filtrar por dueño Y por institución
  const modules = await Module.find({
    owner: req.user._id,
    institution: req.institution._id,
  });
  res.json(modules);
};

// @desc    "Publicar" un módulo en una sección específica
// @route   POST /api/sections/:sectionId/modules
// @access  Private/Professor
const publishModuleToSection = async (req, res) => {
  const { moduleId } = req.body;
  const { sectionId } = req.params;

  // 1. Validar que la sección y el módulo existen DENTRO de la institución
  const section = await Section.findOne({
    _id: sectionId,
    institution: req.institution._id,
  });
  const module = await Module.findOne({
    _id: moduleId,
    institution: req.institution._id,
  });

  if (!section || !module) {
    res.status(404);
    throw new Error("Sección o Módulo no encontrado en esta institución.");
  }

  // 2. Validar que el usuario es el instructor de la sección Y el dueño del módulo
  if (
    section.instructor.toString() !== req.user._id.toString() ||
    module.owner.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Usuario no autorizado para esta acción.");
  }

  // 3. Evitar duplicados: no publicar si ya está publicado en esa sección
  const isAlreadyPublished = module.publishedIn.some(
    (pub) => pub.section.toString() === sectionId
  );
  if (isAlreadyPublished) {
    return res
      .status(400)
      .json({ message: "Este módulo ya ha sido publicado en esta sección." });
  }

  // 4. Añadir la referencia de publicación
  module.publishedIn.push({ section: sectionId });
  await module.save();

  res.status(200).json(module);
};

// @desc    Obtener los módulos publicados en una sección específica
// @route   GET /api/sections/:sectionId/modules
// @access  Private
const getPublishedModulesForSection = async (req, res) => {
  const { sectionId } = req.params;

  // Primero, verificar que la sección solicitada pertenece a la institución del usuario.
  const section = await Section.findOne({
    _id: sectionId,
    institution: req.institution._id,
  });
  if (!section) {
    return res
      .status(404)
      .json({ message: "Sección no encontrada en esta institución." });
  }

  // Si la sección es válida, buscar los módulos publicados en ella.
  const modules = await Module.find({
    "publishedIn.section": sectionId,
    institution: req.institution._id, // Doble seguridad
  }).sort("order");

  res.json(modules);
};

module.exports = {
  createModuleInLibrary,
  getMyLibraryModules,
  publishModuleToSection,
  getPublishedModulesForSection,
};
