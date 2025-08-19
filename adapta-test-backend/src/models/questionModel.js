const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    // Vínculo con el módulo (y tema) al que pertenece
    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Module',
    },
    // Vínculo directo con el profesor dueño para facilitar las consultas
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    questionText: {
        type: String,
        required: [true, 'El texto de la pregunta es obligatorio.'],
    },
    // Un array de objetos para las opciones de respuesta
    options: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true, default: false },
        },
    ],
    // El atributo CLAVE para el motor adaptativo
    difficulty: {
        type: Number,
        required: [true, 'La dificultad es obligatoria.'],
        min: 1,
        max: 5,
    },
    questionType: {
        type: String,
        enum: ['multiple_choice', 'true_false'],
        default: 'multiple_choice',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Question', questionSchema);