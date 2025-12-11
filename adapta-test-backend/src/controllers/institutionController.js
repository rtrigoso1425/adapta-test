const Institution = require("../models/institutionModel");
const User = require("../models/userModel");

// Obtener instituciones con su plan
const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({}).populate("plan", "name price");
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener instituciones" });
  }
};

// Crear Institución + Admin
const createInstitution = async (req, res) => {
  try {
    const { 
      // Datos Institución
      name, code, type, settings, planId, 
      // Datos Admin
      adminName, adminEmail, adminPassword 
    } = req.body;

    // 1. Validaciones
    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ message: "Faltan datos del Administrador (email/password)" });
    }

    const instExists = await Institution.findOne({ code });
    if (instExists) {
      return res.status(400).json({ message: "El código de institución ya existe" });
    }

    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
      return res.status(400).json({ message: "El email del administrador ya está registrado" });
    }

    // 2. Crear Institución
    const institution = await Institution.create({
      name,
      code,
      type,
      settings,
      plan: planId || null // Asignamos el plan si viene
    });

    // 3. Crear Usuario Admin vinculado
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin", // Rol vital
      institution: institution._id
    });

    res.status(201).json({
      institution,
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email
      },
      message: "Institución y Administrador creados exitosamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createInstitution, getInstitutions };