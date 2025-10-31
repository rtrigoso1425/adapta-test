const User = require("../models/userModel");
const Institution = require("../models/institutionModel");
const generateToken = require("../utils/generateToken");
const InstitutionRulesService = require("../services/institutionRulesService");

const getAvailableInstitutions = async (req, res, next) => {
  try {
    const institutions = await Institution.find({ isActive: true })
      .select("name code type")
      .sort("name");
    res.json(institutions);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password, institutionId } = req.body;
    if (!institutionId || !email || !password) {
      return res
        .status(400)
        .json({ message: "Email, contraseña e institución son requeridos" });
    }
    const user = await User.findOne({
      email,
      institution: institutionId,
    }).populate("institution");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuario no encontrado en esta institución" });
    }
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    if (!user.institution.isActive) {
      return res
        .status(403)
        .json({ message: "La institución se encuentra inactiva" });
    }
    const token = generateToken(user._id, user.institution._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: {
        _id: user.institution._id,
        name: user.institution.name,
        type: user.institution.type,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, studentGrade, parentOf } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Nombre, email, contraseña y rol son requeridos." });
    }
    // AHORA ESTA LÍNEA FUNCIONARÁ
    if (!InstitutionRulesService.validateUserRole(role, req.institution)) {
      return res
        .status(400)
        .json({
          message: `El rol '${role}' no es válido para el tipo de institución '${req.institution.type}'.`,
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
      role,
      institution: req.institution._id,
      studentGrade:
        req.institution.type === "high_school" ? studentGrade : undefined,
      parentOf:
        req.institution.type === "high_school" && role === "parent"
          ? parentOf
          : undefined,
    });
    if (user) {
      res
        .status(201)
        .json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
    } else {
      throw new Error("Datos de usuario inválidos.");
    }
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res) => {
  res.json(req.user);
};

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = { institution: req.institution._id };
    if (role) {
      filter.role = role;
    }
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableInstitutions,
  loginUser,
  registerUser,
  getUserProfile,
  getUsers,
};
