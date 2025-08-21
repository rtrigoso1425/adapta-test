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
        coordinator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
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