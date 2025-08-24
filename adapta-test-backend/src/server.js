const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Importar nuestras rutas de nivel superior
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes'); // Para la biblioteca
const questionRoutes = require('./routes/questionRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const academicCycleRoutes = require('./routes/academicCycleRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const sectionContentRoutes = require('./routes/section.content.routes'); // <-- IMPORTAR
const evaluationRoutes = require('./routes/evaluationRoutes');
const careerRoutes = require('./routes/careerRoutes');
const academicProgressRoutes = require('./routes/academicProgressRoutes');
const academicRecordRoutes = require('./routes/academicRecordRoutes');
const submissionRoutes = require('./routes/submissionRoutes'); // <-- 1. IMPORTAR
const gradingRoutes = require('./routes/gradingRoutes'); // <-- IMPORTAR




dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // ¡Middleware muy importante!

// Rutas base de la API
app.get('/', (req, res) => {
    res.send('¡API de AdaptaTest funcionando!');
});

// Registrar las rutas
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes); // Maneja /api/courses Y las anidadas como /api/courses/:id/modules
app.use('/api/modules', moduleRoutes); // Maneja la biblioteca personal
app.use('/api/questions', questionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/academic-cycles', academicCycleRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/sections/:sectionId', sectionContentRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/careers', careerRoutes); // Maneja las carreras
app.use('/api/progress', academicProgressRoutes);
app.use('/api/academic-records', academicRecordRoutes);
app.use('/api/submissions', submissionRoutes); // <-- 2. AÑADIR ESTA LÍNEA
app.use('/api/grading', gradingRoutes); // <-- AÑADIR



// Middleware para capturar rutas no encontradas (error 404)
app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pasa el error al siguiente middleware
});

// Middleware para capturar todos los demás errores (error 500 o el que corresponda)
app.use((err, req, res, next) => {
    // A veces un error puede llegar aquí con un status 200, lo corregimos a 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Es una buena práctica de seguridad no mostrar el 'stack trace' en producción
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});