const User = require("../models/userModel"); // Importamos nuestro modelo de usuario
const Institution = require("../models/institutionModel"); // Importamos nuestro modelo de institución
const generateToken = require("../utils/generateToken");

// @desc    Registrar un nuevo usuario (ahora implementado)
// @route   POST /api/users
// @access  Private/Admin
const registerUser = async (req, res) => {
  const { name, email, password, role, studentGrade, parentOf } = req.body;
  const adminUser = req.user;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Nombre, email, contraseña y rol son requeridos." });
  }

  // Valida que el rol que se intenta crear sea válido para la institución
  if (!InstitutionRulesService.validateUserRole(role, req.institution)) {
    return res
      .status(400)
      .json({
        message: `El rol '${role}' no es válido para esta institución.`,
      });
  }

  const userExists = await User.findOne({
    email,
    institution: req.institution._id,
  });
  if (userExists) {
    return res
      .status(400)
      .json({
        message: "Un usuario con este email ya existe en esta institución.",
      });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role, // Renombrado en el modelo
    institution: req.institution._id,
    studentGrade:
      req.institution.type === "high_school" ? studentGrade : undefined,
    parentOf:
      req.institution.type === "high_school" && role === "parent"
        ? parentOf
        : undefined,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Datos de usuario inválidos.");
  }
};

// @desc    Autenticar (loguear) un usuario
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password, institutionId } = req.body;

  if (!institutionId || !email || !password) {
    return res
      .status(400)
      .json({ message: "Email, contraseña e institución son requeridos" });
  }

  // Buscar usuario EN LA INSTITUCIÓN ESPECÍFICA
  const user = await User.findOne({
    email,
    institution: institutionId,
  }).populate("institution"); // Populamos para tener los datos de la institución

  if (!user) {
    return res.status(401).json({
      message: "Usuario no encontrado en esta institución",
    });
  }

  if (!(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  // Verificar que la institución del usuario esté activa
  if (!user.institution.isActive) {
    return res
      .status(403)
      .json({ message: "La institución se encuentra inactiva" });
  }

  // El token ahora incluye el ID del usuario y de la institución
  const token = generateToken(user._id, user.institution._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role, // Este es el institutionRole que definimos
    institution: {
      _id: user.institution._id,
      name: user.institution.name,
      type: user.institution.type,
    },
    token,
  });
};

// @desc    Obtener el perfil del usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user fue añadido por nuestro middleware 'protect'
  res.json(req.user);
};

// @desc    Obtener usuarios de la institución actual
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const { role } = req.query;
    const filter = { institution: req.institution._id }; // Filtro base por institución
    if (role) {
        filter.role = role;
    }
    
    const users = await User.find(filter).select('-password');
    res.json(users);
};

// @desc    Obtener todas las instituciones activas
// @route   GET /api/institutions
// @access  Public
const getAvailableInstitutions = async (req, res) => {
  const institutions = await Institution.find({ isActive: true })
    .select("name code type") // Solo enviamos la info necesaria al frontend
    .sort("name");
  res.json(institutions);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  getAvailableInstitutions,
};
