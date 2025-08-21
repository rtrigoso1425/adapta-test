const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El título del curso es obligatorio.'],
            trim: true, // Elimina espacios en blanco al inicio y al final
        },
        description: {
            type: String,
            required: [true, 'La descripción del curso es obligatoria.'],
        },
        // Relaciona este curso con el usuario que lo creó (el profesor)
        // Relaciona el curso con un coordinador (opcional al inicio)
        coordinator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        // Un curso puede tener otros cursos como prerrequisitos
        prerequisites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Course', courseSchema);