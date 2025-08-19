const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Module',
    },
    content: { // Contenido principal (esperamos Markdown)
        type: String,
    },
    // MEJORA 1: Campo para la URL de archivos adjuntos (Word, PPT, PDF)
    fileUrl: {
        type: String,
    },
    // MEJORA 2: Nuevos tipos de contenido
    contentType: {
        type: String,
        enum: ['text', 'video_url', 'document_url', 'slides_url'],
        default: 'text',
    },
    order: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);