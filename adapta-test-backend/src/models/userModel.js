const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importar bcryptjs

// Definimos el esquema (la estructura) para nuestros usuarios
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor, añade un nombre.'],
        },
        email: {
            type: String,
            required: [true, 'Por favor, añade un email.'],
            unique: true, // No puede haber dos usuarios con el mismo email
            match: [/.+\@.+\..+/, 'Por favor, introduce un email válido.'],
        },
        password: {
            type: String,
            required: [true, 'Por favor, añade una contraseña.'],
        },
        role: {
            type: String,
            required: true,
            enum: ['student', 'professor', 'coordinator', 'admin', 'parent'], // El rol debe ser uno de estos valores
            default: 'student',
        },
    },
    {
        // Esto añade automáticamente los campos createdAt y updatedAt
        timestamps: true,
    }
);

// Middleware que se ejecuta ANTES de guardar un documento de usuario
userSchema.pre('save', async function (next) {
    // Si la contraseña no ha sido modificada, no hacemos nada y continuamos
    if (!this.isModified('password')) {
        next();
    }

    // Generamos el "salt" - una cadena aleatoria para hacer el hash más seguro
    const salt = await bcrypt.genSalt(10);
    // Hasheamos la contraseña y la reemplazamos en el documento
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Exportamos el modelo para poder usarlo en otras partes de la aplicación
module.exports = mongoose.model('User', userSchema);