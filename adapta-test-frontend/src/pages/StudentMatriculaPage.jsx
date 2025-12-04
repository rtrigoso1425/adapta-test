import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BlurFade } from "../components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Book, X } from "lucide-react";

// --- Acciones de Redux ---
import {
  getSectionsForCourse,
  reset as resetSections,
} from "../features/sections/sectionSlice";
import {
  addSection,
  removeSection,
  confirmMatricula,
} from "../features/matricula/matriculaSlice";

// ===================================================================================
//  SUB-COMPONENTE: Muestra las secciones de un curso específico
// ===================================================================================
const CourseSectionsViewer = ({ course }) => {
  const dispatch = useDispatch();
  const { sections, isLoading } = useSelector((state) => state.sections);
  const { selectedSections } = useSelector((state) => state.matricula);

  useEffect(() => {
    if (course._id) {
      dispatch(getSectionsForCourse(course._id));
    }
    return () => {
      dispatch(resetSections());
    };
  }, [dispatch, course._id]);

  const handleSelectSection = (section) => {
    dispatch(
      addSection({ ...section, courseTitle: course.title, course: course._id })
    );
  };

  // Verificamos si ya hay una sección de este curso en el "carrito"
  const isCourseInCart = !!selectedSections[course._id];

  if (isLoading)
    return <p className="p-5 text-sm text-muted-foreground">Buscando secciones disponibles...</p>;

  return (
    <div className="p-4 bg-card rounded-b-lg">
      {sections && sections.length > 0 ? (
        sections.map((section) => (
          <div
            key={section._id}
            className="flex justify-between items-center py-3 border-b last:border-b-0 border-slate-200 dark:border-zinc-800"
          >
            <div className="text-sm">
              <strong className="text-foreground">Sección {section.sectionCode}</strong>
              <span className="ml-4 text-muted-foreground">Profesor: {section.instructor?.name || "-"}</span>
            </div>
            <button
              onClick={() => handleSelectSection(section)}
              disabled={isCourseInCart}
              className={`px-3 py-1 rounded-md text-sm ${
                isCourseInCart
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  : "bg-primary text-primary-foreground hover:brightness-95"
              }`}
            >
              {isCourseInCart ? "Seleccionado" : "Añadir a Matrícula"}
            </button>
          </div>
        ))
      ) : (
        <p className="py-2 text-sm text-muted-foreground">
          No hay secciones abiertas para este curso en el ciclo académico actual.
        </p>
      )}
    </div>
  );
};

// ===================================================================================
//  SUB-COMPONENTE: Muestra el resumen de la matrícula (el "carrito")
// ===================================================================================
const MatriculaSummary = () => {
  const dispatch = useDispatch();
  const { selectedSections, isLoading, error } = useSelector(
    (state) => state.matricula
  );
  const sectionsArray = Object.values(selectedSections);

  const handleConfirm = () => {
    if (sectionsArray.length === 0) {
      alert("Debes seleccionar al menos un curso para matricularte.");
      return;
    }
    if (
      window.confirm(
        "Resumen de tu matrícula para el periodo actual. ¿Deseas confirmar la matrícula con los cursos seleccionados?"
      )
    ) {
      const sectionIds = sectionsArray.map((s) => s._id);
      dispatch(confirmMatricula(sectionIds));
    }
  };

  return (
    <div className="border-2 border-primary p-4 rounded-lg bg-muted">
      <h3 className="text-lg font-medium text-foreground mb-3">Resumen de tu Matrícula</h3>

      {sectionsArray.length > 0 ? (
        <ul className="space-y-2">
          {sectionsArray.map((section) => (
            <li
              key={section._id}
              className="flex justify-between items-center py-2 border-b last:border-b-0 border-slate-200 dark:border-zinc-800"
            >
              <span className="text-sm text-foreground">
                {section.courseTitle} <span className="text-muted-foreground">- (Sección {section.sectionCode})</span>
              </span>
              <button
                onClick={() => dispatch(removeSection(section.course))}
                className="text-sm px-2 py-1 rounded-md bg-destructive text-primary-foreground hover:brightness-95"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Aún no has seleccionado ningún curso.</p>
      )}

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full mt-4 py-2 rounded-md text-sm bg-primary text-primary-foreground disabled:opacity-60"
      >
        {isLoading ? "Procesando Matrícula..." : "Confirmar Matrícula"}
      </button>

      {error && <p className="text-sm text-destructive mt-3 text-center">{error}</p>}
    </div>
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: Página de Matrícula
// ===================================================================================
const StudentMatriculaPage = () => {
  const { progressData } = useSelector((state) => state.progress);
  const [modalCourse, setModalCourse] = useState(null);

  const openSectionsModal = (course) => setModalCourse(course);
  const closeSectionsModal = () => setModalCourse(null);

  if (!progressData || !progressData.eligibleCourses) {
    return <h2>Cargando cursos disponibles para tu matrícula...</h2>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BlurFade inView delay={0.1}>
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-card/50 p-2.5 rounded-lg flex-shrink-0">
            <Book className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1 text-foreground">Matrícula Académica</h1>
            <p className="text-lg text-foreground mb-2">
              Estás ubicado en el <strong>Ciclo {progressData.currentCycle}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Selecciona las secciones en las que deseas matricularte para el periodo actual.
            </p>
          </div>
        </div>
      </BlurFade>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <Card className="mb-6 bg-card">
            <CardHeader>
              <CardTitle>Resumen de Matrícula</CardTitle>
            </CardHeader>
            <CardContent>
              <MatriculaSummary />
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Cursos Disponibles</h2>
          {progressData.eligibleCourses.length > 0 ? (
            <div className="space-y-4">
              {progressData.eligibleCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden bg-card">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-lg font-medium text-foreground">{course.title}</div>
                      {course.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {course.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openSectionsModal(course)}
                        className="px-3 py-2 rounded-md border bg-transparent text-foreground hover:bg-accent"
                      >
                        Ver Secciones
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 bg-green-50">
              <div className="text-sm">
                <strong>¡Felicitaciones!</strong> Parece que ya has aprobado todos
                los cursos disponibles en tu malla hasta este ciclo.
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Modal superpuesto para ver secciones (centrado) */}
      {modalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeSectionsModal}
          />
          <div className="relative w-full max-w-2xl z-10">
            <Card className="shadow-xl rounded-2xl overflow-hidden bg-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {modalCourse.title}
                  </CardTitle>
                    {modalCourse.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {modalCourse.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={closeSectionsModal}
                  className="p-2 rounded-md hover:bg-muted flex-shrink-0 ml-4"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </CardHeader>
              <CardContent>
                <CourseSectionsViewer course={modalCourse} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMatriculaPage;
