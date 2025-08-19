const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    // CAMBIO 1: El módulo ahora pertenece a un usuario (el profesor)
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // CAMBIO 2: Un array para saber en qué cursos y ciclos se ha publicado este módulo
    publishedIn: [
        {
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCycle' },
        }
    ],
    // Mantenemos el orden, pero se aplicará en el contexto de un curso
    order: {
        type: Number,
        default: 1,
    },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);