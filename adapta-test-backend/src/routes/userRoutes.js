const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');


// Definimos la ruta para el registro de usuarios
router.post('/', registerUser);

// Definimos la ruta para el inicio de sesión de usuarios
router.post('/login', loginUser);

router.get('/profile', protect, getUserProfile); // <-- RUTA PROTEGIDA

module.exports = router;