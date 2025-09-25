const jwt = require('jsonwebtoken');

const generateToken = (userId, institutionId) => {
    return jwt.sign(
        { 
            id: userId, 
            institution: institutionId // El token ahora contiene ambos IDs
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = generateToken;