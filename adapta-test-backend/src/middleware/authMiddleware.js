const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Obtener el token del header (Bearer TOKEN)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Obtener los datos del usuario desde la BD (sin la contraseña)
            // y adjuntarlos al objeto de la petición (req)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Continuar a la siguiente función (el controlador)
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('No autorizado, token falló');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no hay token');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // 'protect' ya debería haber añadido req.user
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403); // 403: Forbidden (Prohibido)
            throw new Error('El usuario no tiene los permisos necesarios para realizar esta acción.');
        }
        next();
    };
};

module.exports = { protect, authorize };