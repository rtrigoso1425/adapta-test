import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getSectionDetails, reset as resetLearning } from "@/features/learning/learningSlice";
import { 
  getModulesForSection, 
  reset as resetContent,
  getLessonsForModule,
  getCompletedLessons
} from "@/features/content/contentSlice";
import { getAssignmentsForSection, reset as resetAssignments } from "@/features/assignments/assignmentSlice";
import {
  createSubmission,
  reset as resetSubmissions,
  getMySubmission,
} from "@/features/submissions/submissionSlice";
import ModuleItem from "@/features/content/ModuleItem";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonView } from "@/components/LessonView";
import { EvaluationView } from "@/components/EvaluationView"; // <-- 1. Importar EvaluationView
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// --- Componentes ---


// ===================================================================================
//  NUEVO SUB-COMPONENTE: Modal Inteligente para Tareas (ADAPTADO A MODO OSCURO)
// ===================================================================================
const AssignmentModal = ({ assignment, onClose }) => {
  const dispatch = useDispatch();
  const { mySubmission, isLoading } = useSelector((state) => state.submissions);
  const [content, setContent] = useState("");

  useEffect(() => {
    // Al abrir, pedimos el estado de nuestra entrega para esta tarea
    if (assignment?.section && assignment?._id) {
      // Creamos el objeto con ambos IDs
      const submissionDetails = {
        sectionId: assignment.section,
        assignmentId: assignment._id,
      };
      dispatch(getMySubmission(submissionDetails));
    }
  }, [dispatch, assignment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = { content };
    dispatch(
      createSubmission({
        sectionId: assignment.section,
        assignmentId: assignment._id,
        submissionData,
      })
    )
      .unwrap()
      .then(() => {
        onClose(); // Cierra el modal si la entrega fue exitosa
      });
  };

  // --- Lógica para decidir qué mostrar dentro del modal ---
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-muted-foreground">Verificando estado de la entrega...</p>;
    }

    if (mySubmission) {
      // Si ya existe una entrega, mostramos la información
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Tu Entrega</h3>
            <div className="bg-muted border border-slate-200 dark:border-zinc-700 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
              {mySubmission.content}
            </div>
          </div>
          
          <hr className="border-slate-200 dark:border-zinc-700" />
          
          <div>
            <h4 className="text-base font-semibold text-foreground mb-3">Calificación</h4>
            {mySubmission.grade != null ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nota:</p>
                  <p className="text-lg font-bold text-primary">{mySubmission.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Feedback del Profesor:</p>
                  <p className="text-sm text-foreground mt-1">
                    {mySubmission.feedback || "Sin comentarios."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Tu tarea ha sido entregada y está pendiente de calificación.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-zinc-700">
            <Button
              type="button"
              onClick={onClose}
              variant="default"
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </div>
      );
    } else {
      // Si no hay entrega, mostramos el formulario
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission-content" className="text-sm font-medium text-foreground">
              Tu Respuesta:
            </Label>
            <textarea
              id="submission-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Escribe tu respuesta aquí..."
              className="w-full px-3 py-2.5 border rounded-lg bg-card text-foreground focus-visible:ring-2 focus-visible:outline-none resize-none"
              rows="8"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-zinc-700">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Enviando..." : "Entregar Tarea"}
            </Button>
          </div>
        </form>
      );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-card border border-slate-200 dark:border-zinc-700 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-slate-200 dark:border-zinc-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Tarea: {assignment.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg text-foreground transition"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-foreground">
              <strong>Instrucciones:</strong>{" "}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {assignment.instructions || "No se proporcionaron instrucciones."}
            </p>
          </div>

          <hr className="border-slate-200 dark:border-zinc-700 my-4" />

          {renderContent()}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: Página de Aprendizaje del Estudiante
// ===================================================================================
const LearningPage = () => {
  const { id: sectionId } = useParams();
  const dispatch = useDispatch();
  const [viewingLesson, setViewingLesson] = useState(null); // Lección seleccionada
  const [currentLessonList, setCurrentLessonList] = useState([]); // Lista de lecciones del módulo
  const [viewingEvaluation, setViewingEvaluation] = useState(null); // <-- 2. Estado para evaluación

  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Selectores de Redux
  const { section, isLoading: isLoadingSection } = useSelector((state) => state.learning);
  const { modules, isLoading: isLoadingModules, lessonsByModule } = useSelector((state) => state.content); // <-- 3. Añadir lessonsByModule
  const { assignments, isLoading: isLoadingAssignments } = useSelector((state) => state.assignments);
  const { mySubmissionsMap } = useSelector((state) => {
    // ... (lógica del selector sin cambios) ...
    const map = {};
    if (Array.isArray(state.submissions.submissions)) { 
       state.submissions.submissions.forEach(sub => {
         if(sub && sub.assignment) {
           map[sub.assignment] = sub;
         }
       });
    } else if (state.submissions.mySubmission) { 
      const sub = state.submissions.mySubmission;
      if(sub && sub.assignment) {
        map[sub.assignment] = sub;
      }
    }
    return { mySubmissionsMap: map };
  });

  // --- EFECTO 1: Carga los datos principales de la página ---
  useEffect(() => {
    dispatch(getSectionDetails(sectionId));
    dispatch(getModulesForSection(sectionId));
    dispatch(getAssignmentsForSection(sectionId));
    
    return () => {
      dispatch(resetLearning());
      dispatch(resetContent());
      dispatch(resetAssignments());
      dispatch(resetSubmissions());
    };
  }, [dispatch, sectionId]);

  // --- 4. EFECTO 2: Carga los datos ANIDADOS (lecciones) ---
  // Este hook se activa cuando `modules` (del Efecto 1) termina de cargar.
  useEffect(() => {
    if (modules && modules.length > 0) {
      // Dispara la carga de las lecciones completadas para toda la sección
      dispatch(getCompletedLessons(sectionId));

      // Dispara la carga de lecciones para CADA módulo
      modules.forEach(module => {
        // Solo fetchear si no están ya en el estado (por si acaso)
        if (!lessonsByModule[module._id]) {
          dispatch(getLessonsForModule(module._id));
        }
      });
    }
  }, [modules, dispatch, sectionId, lessonsByModule]); // Depende de `modules`

const handleSelectLesson = (lesson, lessonList) => {
    setViewingLesson(lesson);
    setCurrentLessonList(lessonList);
    setViewingEvaluation(null);
  };

  const handleStartEvaluation = (moduleId) => {
    setViewingEvaluation(moduleId);
    setViewingLesson(null); // Asegura que la otra vista esté cerrada
  };

const handleBackToList = () => {
    setViewingLesson(null);
    setViewingEvaluation(null); // Cierra ambas vistas
  };

  if (isLoadingSection || !section) {
    // ... (Skeleton de carga de página sin cambios)
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 p-0 lg:p-0">
      
      {/* 1. Header de la Página (ACTUALIZADO) */}
      <div className="mb-6">
        
        {/* --- 3. BOTÓN "VOLVER" AÑADIDO --- */}
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cursos
          </Link>
        </Button>
        
        {/* Contenedor para el resto del header */}
        <div>
          <a 
            href={`http://localhost:5000${section.course.syllabus}`}
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Ver Sílabus del Curso
          </a>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            {section.course.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Sección {section.sectionCode} • Prof. {section.instructor.name}
          </p>
        </div>
      </div>

      {/* 2. Sistema de Pestañas (sin cambios) */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="content">Contenido del Curso</TabsTrigger>
          <TabsTrigger value="assignments">Tareas y Calificaciones</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Contenido (Módulos) */}
        <TabsContent value="content" className="mt-6">
          {/* --- 4. LÓGICA DE RENDERIZADO CONDICIONAL (3 ESTADOS) --- */}
          
          {viewingLesson ? (
            // B. Muestra la VISTA DE LECCIÓN
            <LessonView
              lesson={viewingLesson}
              lessonList={currentLessonList}
              onBackToList={handleBackToList}
              setViewingLesson={setViewingLesson}
            />
          ) : viewingEvaluation ? (
            // C. Muestra la VISTA DE EVALUACIÓN
            <EvaluationView
              moduleId={viewingEvaluation}
              onBackToList={handleBackToList}
            />
          ) : (
            // A. Muestra la LISTA DE MÓDULOS
            <Card>
              <CardHeader>
                <CardTitle>Módulos de Aprendizaje</CardTitle>
                <CardDescription>
                  Completa las lecciones y evalúa tu conocimiento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingModules ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="w-full">
                    {modules.map((module) => (
                      <ModuleItem 
                        key={module._id} 
                        module={module} 
                        onSelectLesson={handleSelectLesson}
                        onStartEvaluation={handleStartEvaluation} // Pasa el nuevo handler
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Pestaña de Tareas (sin cambios) */}
        <TabsContent value="assignments" className="mt-6">
          {/* ... (contenido de la pestaña de tareas sin cambios) ... */}
           <Card>
             <CardHeader>
              <CardTitle>Tareas</CardTitle>
              <CardDescription>
                Gestiona tus entregas y revisa tus calificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment._id}
                      assignment={assignment}
                      mySubmission={mySubmissionsMap[assignment._id]}
                      onOpen={() => setSelectedAssignment(assignment)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* El modal se renderiza aquí (sin cambios) */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};

// --- Estilos ---
const styles = {
  layout: { display: "flex", gap: "20px" },
  assignmentItem: {
    borderBottom: "1px solid #eee",
    padding: "10px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "600px",
  },
  textarea: {
    width: "100%",
    height: "200px",
    marginTop: "10px",
    padding: "10px",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
};

export default LearningPage;
