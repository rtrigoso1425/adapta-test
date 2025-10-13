// seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db.js");

// Importar todos los modelos
const User = require("./src/models/userModel.js");
const Institution = require("./src/models/institutionModel.js");
const Course = require("./src/models/courseModel.js");
const AcademicCycle = require("./src/models/academicCycleModel.js");
const Section = require("./src/models/sectionModel.js");
const Enrollment = require("./src/models/enrollmentModel.js");
const Module = require("./src/models/moduleModel.js");
const Question = require("./src/models/questionModel.js");
// ... y cualquier otro modelo que necesites limpiar

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Limpiar TODA la base de datos
    await Promise.all([
      Institution.deleteMany(),
      User.deleteMany(),
      Course.deleteMany(),
      AcademicCycle.deleteMany(),
      Section.deleteMany(),
      Enrollment.deleteMany(),
      Module.deleteMany(),
      Question.deleteMany(),
    ]);
    console.log("--- Base de Datos Limpiada ---");

    // --- 1. Crear Super Admin ---
    const superadmin = await User.create({
      name: "Super Admin",
      email: "superadmin@adaptatest.com",
      password: "123456",
      role: "superadmin",
    });
    console.log("Super Admin Creado");

    // --- 2. Crear Instituciones ---
    const university = await Institution.create({
      name: "Universidad Tecnológica Demo",
      code: "UTD",
      type: "university",
      settings: { allowParentAccess: false, requiresPrerequisites: true },
    });

    const highSchool = await Institution.create({
      name: "Colegio San Martín",
      code: "CSM",
      type: "high_school",
      settings: { allowParentAccess: true, requiresPrerequisites: false },
    });
    console.log("Instituciones Creadas: UTD y CSM");

    // --- 3. Crear Usuarios para cada Institución ---
    // Universidad
    const uniAdmin = await User.create({
      name: "Admin UTD",
      email: "admin@utd.com",
      password: "123456",
      role: "admin",
      institution: university._id,
    });
    const uniProf = await User.create({
      name: "Profesor UTD",
      email: "profesor@utd.com",
      password: "123456",
      role: "professor",
      institution: university._id,
    });
    const uniStudent = await User.create({
      name: "Alumno UTD",
      email: "alumno@utd.com",
      password: "123456",
      role: "student",
      institution: university._id,
    });

    // Colegio
    const hsAdmin = await User.create({
      name: "Admin CSM",
      email: "admin@csm.com",
      password: "123456",
      role: "admin",
      institution: highSchool._id,
    });
    const hsProf = await User.create({
      name: "Profesor CSM",
      email: "profesor@csm.com",
      password: "123456",
      role: "professor",
      institution: highSchool._id,
    });
    const hsStudent = await User.create({
      name: "Alumno CSM",
      email: "alumno@csm.com",
      password: "123456",
      role: "student",
      institution: highSchool._id,
      studentGrade: "3ro",
    });
    const hsParent = await User.create({
      name: "Padre CSM",
      email: "padre@csm.com",
      password: "123456",
      role: "parent",
      institution: highSchool._id,
      parentOf: [hsStudent._id],
    });
    console.log("Usuarios de Demo Creados");

    // --- 4. Crear Datos Académicos ---
    // Curso para Universidad
    const uniCourse = await Course.create({
      title: "Cálculo I",
      description: "Curso de cálculo diferencial.",
      institution: university._id,
    });

    // Curso para Colegio
    const hsCourse = await Course.create({
      title: "Matemática 3ro",
      description: "Matemática para 3ro de secundaria.",
      institution: highSchool._id,
      targetGrade: "3ro",
    });

    const cycle = await AcademicCycle.create({
      name: "Ciclo 2025-II",
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-12-20"),
      isActive: true,
      institution: university._id,
    });
    const hsCycle = await AcademicCycle.create({
      name: "Año Escolar 2025",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-12-20"),
      isActive: true,
      institution: highSchool._id,
    });

    const uniSection = await Section.create({
      course: uniCourse._id,
      instructor: uniProf._id,
      academicCycle: cycle._id,
      sectionCode: "C1-001",
      capacity: 30,
      institution: university._id,
    });
    const hsSection = await Section.create({
      course: hsCourse._id,
      instructor: hsProf._id,
      academicCycle: hsCycle._id,
      sectionCode: "3A",
      capacity: 25,
      institution: highSchool._id,
    });

    await Enrollment.create({
      student: uniStudent._id,
      section: uniSection._id,
      institution: university._id,
    });
    await Enrollment.create({
      student: hsStudent._id,
      section: hsSection._id,
      institution: highSchool._id,
    });
    console.log("Cursos, Secciones y Matrículas Creadas");

    console.log("\n¡DATOS DE PRUEBA IMPORTADOS EXITOSAMENTE!");
    process.exit();
  } catch (error) {
    console.error(`Error en el seeder: ${error}`);
    process.exit(1);
  }
};

// Lógica para correr el seeder desde la terminal
if (process.argv[2] === "-d") {
  // destroyData(); // Puedes implementar una función para destruir si lo necesitas
} else {
  importData();
}
