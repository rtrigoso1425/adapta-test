import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyProgress, reset } from "../progress/progressSlice";
import CareerEnrollmentPage from "../../pages/CareerEnrollmentPage";
import StudentMatriculaPage from "../../pages/StudentMatriculaPage";
import StudentCoursesPage from "../../pages/StudentCoursesPage";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton"; // <-- 1. Importar

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { progressData, isLoading } = useSelector((state) => state.progress);

  useEffect(() => {
    dispatch(getMyProgress());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // --- 2. Estado de Carga MEJORADO ---
  if (isLoading || !user || (user.institution.type === "university" && !progressData)) {
    return <DashboardSkeleton />;
  }
  
  // Fallback si el progreso falla
  if (user.institution.type === "university" && !progressData) {
     return <h2>No se pudo cargar tu información. Intenta refrescar la página.</h2>;
  }

  // --- Flujo para UNIVERSIDADES ---
  if (user.institution.type === "university") {
    if (progressData.needsCareerEnrollment) {
      return <CareerEnrollmentPage />;
    } else if (
      progressData.currentEnrollments &&
      progressData.currentEnrollments.length > 0
    ) {
      return <StudentCoursesPage />;
    } else {
      return <StudentMatriculaPage />;
    }
  }

  // --- Flujo para COLEGIOS (high_school) ---
  if (user.institution.type === "high_school") {
    // Los colegios van directo a su lista de cursos
    return <StudentCoursesPage />;
  }

  return <h1>Dashboard no disponible para este tipo de institución.</h1>;
};

export default StudentDashboard;
