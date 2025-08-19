const User = require('../models/userModel'); // Importamos nuestro modelo de usuario
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    // 1. Extraemos los datos del cuerpo de la petición
    const { name, email, password, role } = req.body;

    // 2. Validamos que tengamos todos los datos
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Por favor, completa todos los campos.');
    }

    // 3. Verificamos si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('El usuario ya existe.');
    }

    // 4. Creamos el nuevo usuario en la base de datos
    // El hasheo de la contraseña se hace automáticamente gracias al middleware en el modelo
    const user = await User.create({
        name,
        email,
        password,
        role, // Si no se provee, por defecto será 'student'
    });

    // 5. Si el usuario se creó exitosamente, enviamos una respuesta
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario inválidos.');
    }
};

// @desc    Autenticar (loguear) un usuario
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Buscar al usuario por email
    const user = await User.findOne({ email });

    // Verificar que el usuario existe Y que la contraseña coincide
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // 401: Unauthorized
        throw new Error('Credenciales inválidas');
    }
};

// @desc    Obtener el perfil del usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user fue añadido por nuestro middleware 'protect'
    res.json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
};