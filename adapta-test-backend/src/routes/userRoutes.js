const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  getAvailableInstitutions, // <-- Importamos la nueva función
} = require("../controllers/userController");

// @route   GET /api/users/institutions
// @desc    Ruta PÚBLICA para obtener la lista de instituciones para el login
// @access  Public
router.get("/institutions", getAvailableInstitutions);

// @route   POST /api/users/login
// @desc    Login de usuario (ahora requiere institución)
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/users/profile
// @desc    Obtener perfil del usuario logueado
// @access  Private
router.get("/profile", protect, getUserProfile);

// @route   GET /api/users
// @desc    Obtener todos los usuarios de la institución del admin
// @access  Private (Solo Admin de institución)
router
  .route("/")
  .get(protect, authorize("admin"), getUsers)
  // @route   POST /api/users
  // @desc    Registrar un nuevo usuario en la institución del admin
  // @access  Private (Solo Admin de institución)
  .post(protect, authorize("admin"), registerUser);

module.exports = router;
