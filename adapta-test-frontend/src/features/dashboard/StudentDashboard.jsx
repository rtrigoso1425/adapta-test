// src/features/dashboard/StudentDashboard.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyProgress, reset } from "../progress/progressSlice";
import CareerEnrollmentPage from "../../pages/CareerEnrollmentPage";
import StudentMatriculaPage from "../../pages/StudentMatriculaPage";
import StudentCoursesPage from "../../pages/StudentCoursesPage";

const StudentDashboard = () => {
  const dispatch = useDispatch();

  // Obtenemos tanto la información del usuario (para saber el tipo de institución) como su progreso
  const { user } = useSelector((state) => state.auth);
  const { progressData, isLoading } = useSelector((state) => state.progress);

  useEffect(() => {
    // Al montar el componente, pedimos el progreso académico del estudiante
    dispatch(getMyProgress());

    // Al desmontar, limpiamos el estado para la siguiente carga
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // --- Estado de Carga ---
  if (isLoading || !user) {
    return <h2>Cargando tu progreso académico...</h2>;
  }

  if (!progressData) {
    return (
      <h2>No se pudo cargar tu información. Intenta refrescar la página.</h2>
    );
  }

  // ##################################################################
  // ### LÓGICA DIFERENCIADA POR TIPO DE INSTITUCIÓN ###
  // ##################################################################

  // --- Flujo para UNIVERSIDADES ---
  if (user.institution.type === "university") {
    // La lógica de tres estados que ya tenías sigue siendo perfecta aquí
    if (progressData.needsCareerEnrollment) {
      // 1. No tiene carrera: Debe inscribirse en una.
      return <CareerEnrollmentPage />;
    } else if (
      progressData.currentEnrollments &&
      progressData.currentEnrollments.length > 0
    ) {
      // 2. Tiene carrera Y está matriculado: Muestra sus cursos actuales.
      return <StudentCoursesPage />;
    } else {
      // 3. Tiene carrera, pero no está matriculado: Muestra la página de matrícula.
      return <StudentMatriculaPage />;
    }
  }

  // --- Flujo para COLEGIOS (high_school) ---
  if (user.institution.type === "high_school") {
    // La lógica es mucho más simple. El backend ya nos da los cursos de su grado.
    // La matrícula es un proceso que maneja el admin, por lo que el estudiante
    // directamente ve los cursos en los que está inscrito.
    // Reutilizamos StudentCoursesPage que ahora mostrará los cursos de su matrícula actual.
    return <StudentCoursesPage />;
  }

  // Fallback por si acaso
  return <h1>Dashboard no disponible para este tipo de institución.</h1>;
};

export default StudentDashboard;
