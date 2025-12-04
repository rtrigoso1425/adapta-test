import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyProgress, reset } from "../progress/progressSlice";
import CareerEnrollmentPage from "../../pages/CareerEnrollmentPage";
import StudentMatriculaPage from "../../pages/StudentMatriculaPage";
import StudentCoursesPage from "../../pages/StudentCoursesPage";
import CourseFlipCard from "../../components/flip-card-course";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton"; // <-- 1. Importar
import { BlurFade } from "../../components/ui/blur-fade";
import { Book } from "lucide-react";

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
      return (
        <div className="container mx-auto px-4 py-8">
          <BlurFade inView delay={0.1}>
            <div className="mb-8">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-card/50 p-2.5 rounded-lg">
                    <Book className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">Mis Cursos</h1>
                    <p className="text-xl text-foreground">Tus cursos matriculados</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aquí están los cursos en los que estás matriculado. Haz click en una tarjeta para ver más.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {progressData.currentEnrollments.map((enroll) => {
              const course = enroll.course || enroll;
              const modulesCount =
                (Array.isArray(course?.modules) && course.modules.length) ||
                course?.modulesCount ||
                course?.moduleCount ||
                (Array.isArray(course?.lessons) && course.lessons.length) ||
                0;
              const courseId = course._id || course.id || null;
              const sectionId = enroll.section?._id || enroll.sectionId || null;
              const title = enroll.section.course.title || course.name || "Curso sin título";
              const description = enroll.section.course.description || course.summary || "";
              const sectionLabel = enroll.section?.sectionCode || enroll.sectionCode || "";
              const instructor =
                enroll.section.instructor.name ||
                "Profesor";
              const progressPercent =
                enroll.progress?.percent ??
                enroll.completion ??
                enroll.progressPercent ??
                0;
              const status = enroll.status || "En progreso";
              const code = sectionLabel || course.code || (courseId ? courseId.substring(0, 8) : "");

              return (
                <div key={enroll._id || courseId || sectionId} className="flex justify-center">
                  <CourseFlipCard
                    title={title}
                    subtitle={sectionLabel ? `Sección: ${sectionLabel}` : ""}
                    description={description}
                    features={[
                      `Sección: ${sectionLabel || "-"}`,
                      `Estado: ${status || "Matriculado"}`,
                    ]}
                    color="#06b6d4"
                    actionLabel="Ir al Curso"
                    courseId={courseId}
                    sectionId={sectionId}
                    status={status}
                    code={code}
                    instructorName={instructor}
                    progressPercent={progressPercent}
                    modulesCount={modulesCount}
                  />
                </div>
              );
            })}
          </div>
        </div>
     )} else {
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
