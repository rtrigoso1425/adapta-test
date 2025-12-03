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

// --- Componentes ---


// ===================================================================================
//  NUEVO SUB-COMPONENTE: Modal Inteligente para Tareas
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
      return <p>Verificando estado de la entrega...</p>;
    }

    if (mySubmission) {
      // Si ya existe una entrega, mostramos la información
      return (
        <div>
          <h3>Tu Entrega</h3>
          <p style={styles.submissionBox}>{mySubmission.content}</p>
          <hr />
          <h4>Calificación</h4>
          {mySubmission.grade != null ? (
            <div>
              <p>
                <strong>Nota:</strong> {mySubmission.grade}
              </p>
              <p>
                <strong>Feedback del Profesor:</strong>{" "}
                {mySubmission.feedback || "Sin comentarios."}
              </p>
            </div>
          ) : (
            <p>Tu tarea ha sido entregada y está pendiente de calificación.</p>
          )}
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      );
    } else {
      // Si no hay entrega, mostramos el formulario
      return (
        <form onSubmit={handleSubmit}>
          <label htmlFor="submission-content">Tu Respuesta:</label>
          <textarea
            id="submission-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Escribe tu respuesta aquí..."
            style={styles.textarea}
          ></textarea>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Entregar Tarea"}
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Tarea: {assignment.title}</h2>
          <button
            onClick={onClose}
            style={{
              height: "40px",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
        <p>
          <strong>Instrucciones:</strong>{" "}
          {assignment.instructions || "No se proporcionaron instrucciones."}
        </p>
        <hr />
        {renderContent()}
      </div>
    </div>
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
