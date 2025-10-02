const User = require("../models/userModel");
// const Institution = require("../models/institutionModel"); // COMENTADO: Ya no necesitamos el modelo de institución
const generateToken = require("../utils/generateToken");

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Private/Admin
const registerUser = async (req, res) => {
  const { name, email, password, role, studentGrade, parentOf } = req.body;
  // const adminUser = req.user; // COMENTADO: Variable no utilizada

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Nombre, email, contraseña y rol son requeridos." });
  }

  // COMENTADO: Validación de rol por institución
  // if (!InstitutionRulesService.validateUserRole(role, req.institution)) {
  //   return res
  //     .status(400)
  //     .json({
  //       message: `El rol '${role}' no es válido para esta institución.`,
  //     });
  // }

  // COMENTADO: Búsqueda de usuario por institución
  // const userExists = await User.findOne({
  //   email,
  //   institution: req.institution._id,
  // });

  // ACTUALIZADO: Búsqueda de usuario sin institución
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(400)
      .json({
        message: "Un usuario con este email ya existe.",
      });
  }

  // COMENTADO: Creación con institución
  // const user = await User.create({
  //   name,
  //   email,
  //   password,
  //   role: role,
  //   institution: req.institution._id,
  //   studentGrade:
  //     req.institution.type === "high_school" ? studentGrade : undefined,
  //   parentOf:
  //     req.institution.type === "high_school" && role === "parent"
  //       ? parentOf
  //       : undefined,
  // });

  // ACTUALIZADO: Creación sin institución
  const user = await User.create({
    name,
    email,
    password,
    role: role,
    studentGrade: studentGrade,
    parentOf: role === "parent" ? parentOf : undefined,
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
  // COMENTADO: institutionId ya no es necesario
  // const { email, password, institutionId } = req.body;
  const { email, password } = req.body;

  // COMENTADO: Validación con institución
  // if (!institutionId || !email || !password) {
  //   return res
  //     .status(400)
  //     .json({ message: "Email, contraseña e institución son requeridos" });
  // }

  // ACTUALIZADO: Validación sin institución
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos" });
  }

  // COMENTADO: Buscar usuario con institución
  // const user = await User.findOne({
  //   email,
  //   institution: institutionId,
  // }).populate("institution");

  // ACTUALIZADO: Buscar usuario sin institución
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Usuario no encontrado",
    });
  }

  if (!(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  // COMENTADO: Verificar institución activa
  // if (!user.institution.isActive) {
  //   return res
  //     .status(403)
  //     .json({ message: "La institución se encuentra inactiva" });
  // }

  // COMENTADO: Token con institución
  // const token = generateToken(user._id, user.institution._id);

  // ACTUALIZADO: Token sin institución
  const token = generateToken(user._id);

  // COMENTADO: Respuesta con institución
  // res.json({
  //   _id: user._id,
  //   name: user.name,
  //   email: user.email,
  //   role: user.role,
  //   institution: {
  //     _id: user.institution._id,
  //     name: user.institution.name,
  //     type: user.institution.type,
  //   },
  //   token,
  // });

  // ACTUALIZADO: Respuesta sin institución
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
};

// @desc    Obtener el perfil del usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  res.json(req.user);
};

// @desc    Obtener usuarios
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const { role } = req.query;
    
    // COMENTADO: Filtro por institución
    // const filter = { institution: req.institution._id };
    
    // ACTUALIZADO: Filtro sin institución
    const filter = {};
    
    if (role) {
        filter.role = role;
    }
    
    const users = await User.find(filter).select('-password');
    res.json(users);
};

// @desc    Obtener todas las instituciones activas
// @route   GET /api/institutions
// @access  Public
// COMENTADO: Esta función completa ya no es necesaria sin instituciones
const getAvailableInstitutions = async (req, res) => {
  // const institutions = await Institution.find({ isActive: true })
  //   .select("name code type")
  //   .sort("name");
  // res.json(institutions);
  
  // ACTUALIZADO: Devolver array vacío o mensaje
  res.json({ message: "Las instituciones han sido deshabilitadas" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  getAvailableInstitutions,
};