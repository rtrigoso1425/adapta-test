// data/sampleData.js

// Contraseña para todos los usuarios: '123456'
const users = [
    { name: 'Admin User', email: 'admin@adaptatest.com', password: '123456', role: 'admin' },
    { name: 'Carlos Santana', email: 'carlos.santana@adaptatest.com', password: '123456', role: 'professor' },
    { name: 'Andrea Bocelli', email: 'andrea.bocelli@adaptatest.com', password: '123456', role: 'professor' },
    { name: 'Ana Torres', email: 'ana.torres@adaptatest.com', password: '123456', role: 'student' },
    { name: 'Luis Vega', email: 'luis.vega@adaptatest.com', password: '123456', role: 'student' },
    { name: 'Sofia Reyes', email: 'sofia.reyes@adaptatest.com', password: '123456', role: 'student' }
];

const courses = [
    { title: 'MAT-101: Fundamentos de Álgebra', description: 'Un curso introductorio a los conceptos clave del álgebra.' },
    { title: 'CS-101: Introducción a la Programación con JS', description: 'Aprende los fundamentos de la programación y algoritmos.' },
];

const academicCycles = [
    { name: 'Ciclo Académico 2025-II', startDate: new Date('2025-08-01'), endDate: new Date('2025-12-20'), isActive: true },
];

const modules = [
    { title: 'Unidad 1: Expresiones Algebraicas' },
    { title: 'Unidad 2: Ecuaciones de Primer Grado' },
    { title: 'Unidad 1: Fundamentos y Sintaxis de JS' },
];

const lessons = [
    { moduleTitle: 'Unidad 1: Expresiones Algebraicas', title: '1.1 - ¿Qué es un monomio?', content: 'Contenido sobre monomios...', order: 1 },
    { moduleTitle: 'Unidad 1: Expresiones Algebraicas', title: '1.2 - Suma y Resta de Polinomios', content: 'Contenido sobre operaciones...', order: 2 },
    { moduleTitle: 'Unidad 1: Fundamentos y Sintaxis de JS', title: '1.1 - Variables y Tipos de Datos', content: 'Contenido sobre let, const, var...', order: 1 },
];

const questions = [
    { moduleTitle: 'Unidad 1: Expresiones Algebraicas', difficulty: 1, questionText: '¿Cuántos términos tiene un binomio?', options: [{ text: 'Uno', isCorrect: false }, { text: 'Dos', isCorrect: true }] },
    { moduleTitle: 'Unidad 1: Expresiones Algebraicas', difficulty: 3, questionText: 'El resultado de (x+2)(x-2) es:', options: [{ text: 'x² - 4', isCorrect: true }, { text: 'x² + 4', isCorrect: false }] },
    { moduleTitle: 'Unidad 2: Ecuaciones de Primer Grado', difficulty: 2, questionText: 'Si 2x = 8, ¿cuál es el valor de x?', options: [{ text: '4', isCorrect: true }, { text: '6', isCorrect: false }] },
];

module.exports = { users, courses, academicCycles, modules, lessons, questions };