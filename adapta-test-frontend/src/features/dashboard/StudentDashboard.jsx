import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyProgress, reset } from "../progress/progressSlice";
import CareerEnrollmentPage from "../../pages/CareerEnrollmentPage";
import StudentMatriculaPage from "../../pages/StudentMatriculaPage";
import StudentCoursesPage from "../../pages/StudentCoursesPage"; // <-- 1. IMPORTAR

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { progressData, isLoading } = useSelector((state) => state.progress);

  useEffect(() => {
    dispatch(getMyProgress());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (isLoading) {
    return <h2>Cargando tu progreso académico...</h2>;
  }

  if (!progressData) {
    return <h2>No se pudo cargar tu información. Intenta de nuevo.</h2>;
  }

  // ===============================================================
  // 👇 LA LÓGICA DE TRES ESTADOS
  // ===============================================================
  if (progressData.needsCareerEnrollment) {
    // ESTADO 1: No tiene carrera
    return <CareerEnrollmentPage />;
  } else if (
    progressData.currentEnrollments &&
    progressData.currentEnrollments.length > 0
  ) {
    // ESTADO 2: Tiene carrera Y está matriculado en el ciclo actual
    return <StudentCoursesPage />; // <-- Esto ahora muestra la vista con historial y filtro
  } else {
    // ESTADO 3: Tiene carrera, pero necesita matricularse
    return <StudentMatriculaPage />;
  }
};

export default StudentDashboard;
