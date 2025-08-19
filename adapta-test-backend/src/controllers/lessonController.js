const Lesson = require('../models/lessonModel');
const Module = require('../models/moduleModel');

// @desc    Crear una nueva lección en un módulo de la biblioteca del profesor
// @route   POST /api/modules/:moduleId/lessons
// @access  Private/Professor (solo el dueño del módulo)
const createLessonInModule = async (req, res) => {
    const { title, content, contentType, fileUrl } = req.body;
    const { moduleId } = req.params;

    // 1. Verificar que el módulo padre existe
    const parentModule = await Module.findById(moduleId);

    if (!parentModule) {
        res.status(404);
        throw new Error('Módulo no encontrado.');
    }

    // 2. VERIFICACIÓN DE PERMISOS CORREGIDA: ¿El usuario es el dueño ('owner') del módulo?
    if (parentModule.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Usuario no autorizado para añadir lecciones a este módulo.');
    }
    
    // 3. Lógica para el orden
    const lessonCount = await Lesson.countDocuments({ module: moduleId });
    const order = lessonCount + 1;

    // 4. Crear la lección
    const lesson = await Lesson.create({
        title,
        content,
        contentType,
        fileUrl,
        module: moduleId,
        order,
    });

    res.status(201).json(lesson);
};

// @desc    Obtener todas las lecciones de un módulo de la biblioteca
// @route   GET /api/modules/:moduleId/lessons
// @access  Private
const getLessonsFromModule = async (req, res) => {
    const { moduleId } = req.params;

    const parentModule = await Module.findById(moduleId);
    if (!parentModule) {
        res.status(404);
        throw new Error('Módulo no encontrado.');
    }

    // --- Lógica de Permisos para Lectura ---
    // Permitiremos ver las lecciones si:
    // 1. El usuario es el dueño del módulo.
    // 2. O si el módulo ha sido publicado en al menos un curso (lógica simplificada para el MVP).
    const isOwner = parentModule.owner.toString() === req.user._id.toString();
    const isPublished = parentModule.publishedIn && parentModule.publishedIn.length > 0;

    // Por ahora, para simplificar, un rol que no sea el dueño solo puede ver si está publicado.
    // Podríamos añadir una lógica más compleja para verificar la matrícula del estudiante.
    if (!isOwner && !isPublished) {
         res.status(403);
         throw new Error('No autorizado para ver estas lecciones.');
    }

    const lessons = await Lesson.find({ module: moduleId }).sort('order');
    res.json(lessons);
};

module.exports = {
    createLessonInModule,
    getLessonsFromModule,
};