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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});