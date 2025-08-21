const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { users, courses, academicCycles, modules, lessons, questions } = require('./data/sampleData.js');

// Importar todos los modelos
const User = require('./src/models/userModel.js');
const Course = require('./src/models/courseModel.js');
const AcademicCycle = require('./src/models/academicCycleModel.js');
const Section = require('./src/models/sectionModel.js');
const Enrollment = require('./src/models/enrollmentModel.js');
const Module = require('./src/models/moduleModel.js');
const Lesson = require('./src/models/lessonModel.js');
const Question = require('./src/models/questionModel.js');
const Assignment = require('./src/models/assignmentModel.js');
const Submission = require('./src/models/submissionModel.js');

const connectDB = require('./src/config/db.js');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();
        // Limpiar la base de datos
        await Promise.all([
            User.deleteMany(), Course.deleteMany(), AcademicCycle.deleteMany(),
            Section.deleteMany(), Enrollment.deleteMany(), Module.deleteMany(),
            Lesson.deleteMany(), Question.deleteMany(), Assignment.deleteMany(), Submission.deleteMany()
        ]);
        console.log('Datos antiguos eliminados...');

        // --- Creación de Datos ---
        const createdUsers = await User.insertMany(users);
        const professor1 = createdUsers.find(u => u.email === 'carlos.santana@adaptatest.com');
        const professor2 = createdUsers.find(u => u.email === 'andrea.bocelli@adaptatest.com');
        const student1 = createdUsers.find(u => u.email === 'ana.torres@adaptatest.com');
        const student2 = createdUsers.find(u => u.email === 'luis.vega@adaptatest.com');

        // Cursos (como plantillas, sin instructor)
        const createdCourses = await Course.insertMany(courses.map(c => ({ title: c.title, description: c.description })));
        const algebraCourse = createdCourses.find(c => c.title.includes('Álgebra'));
        const programmingCourse = createdCourses.find(c => c.title.includes('Programación'));

        const createdCycle = (await AcademicCycle.insertMany(academicCycles))[0];

        // Secciones (aquí se asigna el instructor)
        const algebraSection = await Section.create({ course: algebraCourse._id, instructor: professor1._id, academicCycle: createdCycle._id, sectionCode: 'ALG-001', capacity: 30 });
        const programmingSection = await Section.create({ course: programmingCourse._id, instructor: professor2._id, academicCycle: createdCycle._id, sectionCode: 'CS-001', capacity: 25 });

        await Enrollment.insertMany([
            { student: student1._id, section: algebraSection._id },
            { student: student2._id, section: programmingSection._id },
            { student: student2._id, section: algebraSection._id },
        ]);
        console.log('Entidades académicas creadas...');

        // Contenido de la Biblioteca del Profesor 1
        const p1_mod1 = await Module.create({ title: 'Unidad 1: Expresiones Algebraicas', owner: professor1._id });
        const p1_mod2 = await Module.create({ title: 'Unidad 2: Ecuaciones de Primer Grado', owner: professor1._id });
        await Lesson.create({ module: p1_mod1._id, title: '1.1 - ¿Qué es un monomio?', content: '...', order: 1 });
        await Lesson.create({ module: p1_mod1._id, title: '1.2 - Suma y Resta de Polinomios', content: '...', order: 2 });
        await Question.create({ module: p1_mod1._id, owner: professor1._id, difficulty: 1, questionText: '¿Cuántos términos tiene un binomio?', options: [{ text: 'Dos', isCorrect: true }] });

        // Contenido de la Biblioteca del Profesor 2
        const p2_mod1 = await Module.create({ title: 'Unidad 1: Fundamentos y Sintaxis de JS', owner: professor2._id });
        await Lesson.create({ module: p2_mod1._id, title: '1.1 - Variables y Tipos de Datos', content: '...', order: 1 });
        await Question.create({ module: p2_mod1._id, owner: professor2._id, difficulty: 1, questionText: '¿Palabra clave para una variable que no cambiará?', options: [{ text: 'const', isCorrect: true }] });

        console.log('Contenido de Bibliotecas creado...');

        // Publicar Módulos y crear Tareas
        p1_mod1.publishedIn.push({ section: algebraSection._id });
        await p1_mod1.save();
        await Assignment.create({ section: algebraSection._id, title: 'Tarea 1: Ensayo de Polinomios' });

        console.log('¡Datos importados exitosamente!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    // Implementar lógica para borrar datos si se desea
    console.log('Función de destrucción no implementada.');
    process.exit();
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}