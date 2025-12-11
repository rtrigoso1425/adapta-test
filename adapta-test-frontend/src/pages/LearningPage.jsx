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
import { EvaluationView } from "@/components/EvaluationView"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useValidateId } from '../hooks/useValidateId';

// ... (El componente AssignmentModal se mantiene IGUAL, ya que funciona bien para vista individual)
const AssignmentModal = ({ assignment, onClose }) => {
  const dispatch = useDispatch();
  const { mySubmission, isLoading } = useSelector((state) => state.submissions);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (assignment?.section && assignment?._id) {
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
        setContent("");
        onClose();
      });
  };
  
  // ... (Resto del renderizado del Modal igual que tu código original)
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-muted-foreground text-center py-8">Verificando estado de la entrega...</p>;
    }

    if (mySubmission) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
              ✓ Tarea Entregada
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium">Estado:</p>
                <p className="text-green-600 dark:text-green-400">Entregada</p>
              </div>
              {mySubmission.createdAt && (
                <div>
                  <p className="text-green-700 dark:text-green-300 font-medium">Fecha de Entrega:</p>
                  <p className="text-green-600 dark:text-green-400">
                    {new Date(mySubmission.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground mb-3">Tu Respuesta</h4>
            <div className="bg-muted border border-slate-200 dark:border-zinc-700 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
              {mySubmission.content}
            </div>
          </div>
          <hr className="border-slate-200 dark:border-zinc-700" />
          <div>
            <h4 className="text-base font-semibold text-foreground mb-3">Calificación del Profesor</h4>
            {mySubmission.grade != null ? (
              <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nota:</p>
                  <p className="text-2xl font-bold text-primary mt-1">{mySubmission.grade}</p>
                </div>
                {mySubmission.feedback && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Comentarios:</p>
                    <p className="text-sm text-foreground mt-2 bg-card p-3 rounded border border-slate-200 dark:border-zinc-700">
                      {mySubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300 italic font-medium">
                  ⏳ Tu tarea ha sido entregada y está pendiente de calificación.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-zinc-700">
            <Button type="button" onClick={onClose} variant="default" className="w-full">
              Cerrar
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              📝 Esta tarea aún no ha sido entregada. Completa el formulario y envía tu respuesta.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submission-content" className="text-sm font-medium text-foreground">
                Tu Respuesta
              </Label>
              <textarea
                id="submission-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Escribe tu respuesta aquí..."
                className="w-full px-3 py-2.5 border rounded-lg bg-card text-foreground focus-visible:ring-2 focus-visible:outline-none resize-none min-h-[200px] border-slate-200 dark:border-zinc-700"
              />
              <p className="text-xs text-muted-foreground">
                Caracteres: {content.length}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-zinc-700">
              <Button type="button" onClick={() => { setContent(""); onClose(); }} variant="outline" className="w-full">
                Cancelar
              </Button>
              <Button type="submit" variant="default" disabled={isLoading || !content.trim()} className="w-full">
                {isLoading ? "Enviando..." : "Entregar Tarea"}
              </Button>
            </div>
          </form>
        </div>
      );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-card border border-slate-200 dark:border-zinc-700 shadow-xl">
        <div className="sticky top-0 bg-card border-b border-slate-200 dark:border-zinc-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{assignment.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {assignment.instructions ? assignment.instructions.substring(0, 80) + "..." : "Sin descripción"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg text-foreground transition" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{renderContent()}</div>
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
  const isValidId = useValidateId(sectionId); // ← Validar ID
  const dispatch = useDispatch();
  const [viewingLesson, setViewingLesson] = useState(null);
  const [currentLessonList, setCurrentLessonList] = useState([]);
  const [viewingEvaluation, setViewingEvaluation] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // 1. ESTADO LOCAL PARA MAPEAR ENTREGAS (La solución clave)
  const [submissionsStatusMap, setSubmissionsStatusMap] = useState({});

  // Selectores de Redux
  const { section, isLoading: isLoadingSection } = useSelector((state) => state.learning);
  const { modules, isLoading: isLoadingModules, lessonsByModule } = useSelector((state) => state.content);
  const { assignments, isLoading: isLoadingAssignments } = useSelector((state) => state.assignments);

  // --- EFECTO 1: Carga los datos principales ---
  useEffect(() => {
    if (isValidId) {
      dispatch(getSectionDetails(sectionId));
      dispatch(getModulesForSection(sectionId));
      dispatch(getAssignmentsForSection(sectionId));
    }
    
    return () => {
      dispatch(resetLearning());
      dispatch(resetContent());
      dispatch(resetAssignments());
      dispatch(resetSubmissions());
    };
  }, [dispatch, sectionId, isValidId]);

  // --- EFECTO 2: Carga lecciones ---
  useEffect(() => {
    if (modules && modules.length > 0) {
      dispatch(getCompletedLessons(sectionId));
      modules.forEach(module => {
        if (!lessonsByModule[module._id]) {
          dispatch(getLessonsForModule(module._id));
        }
      });
    }
  }, [modules, dispatch, sectionId, lessonsByModule]);

  // --- EFECTO 3 (CORREGIDO): Cargar entregas y guardarlas en estado LOCAL ---
  useEffect(() => {
    const fetchAllSubmissions = async () => {
      if (assignments && assignments.length > 0) {
        const results = {};
        
        // Creamos un array de promesas para esperar a que todas terminen
        const promises = assignments.map(async (assignment) => {
          try {
            // Usamos .unwrap() para obtener el resultado crudo sin depender de que
            // el estado global de Redux se actualice (evitando la condición de carrera)
            const result = await dispatch(
              getMySubmission({
                sectionId: assignment.section,
                assignmentId: assignment._id,
              })
            ).unwrap();
            
            // Si la promesa se resuelve (hay entrega), la guardamos en el mapa
            results[assignment._id] = result;
          } catch (error) {
            // Si da error (ej. 404 no encontrado), simplemente no guardamos nada para esta ID
            // Esto significa que el estudiante no ha entregado la tarea aún.
            // console.log(`No submission found for assignment ${assignment._id}`);
          }
        });

        await Promise.all(promises);
        setSubmissionsStatusMap(results);
      }
    };

    fetchAllSubmissions();
    
    // Agregamos selectedAssignment como dependencia para que si el usuario entrega una tarea
    // y cierra el modal, la lista se actualice.
  }, [assignments, dispatch, selectedAssignment]);

  const handleSelectLesson = (lesson, lessonList) => {
    setViewingLesson(lesson);
    setCurrentLessonList(lessonList);
    setViewingEvaluation(null);
  };

  const handleStartEvaluation = (moduleId) => {
    setViewingEvaluation(moduleId);
    setViewingLesson(null);
  };

  const handleBackToList = () => {
    setViewingLesson(null);
    setViewingEvaluation(null);
  };

  if (isLoadingSection || !section) {
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
      
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cursos
          </Link>
        </Button>
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

      {/* Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="content">Contenido del Curso</TabsTrigger>
          <TabsTrigger value="assignments">Tareas y Calificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          {viewingLesson ? (
            <LessonView
              lesson={viewingLesson}
              lessonList={currentLessonList}
              onBackToList={handleBackToList}
              setViewingLesson={setViewingLesson}
            />
          ) : viewingEvaluation ? (
            <EvaluationView
              moduleId={viewingEvaluation}
              onBackToList={handleBackToList}
            />
          ) : (
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
                        onStartEvaluation={handleStartEvaluation}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="assignments" className="mt-6">
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
                      // AQUÍ ESTÁ EL CAMBIO CLAVE:
                      // Usamos el mapa local en lugar del selector de Redux que estaba fallando
                      mySubmission={submissionsStatusMap[assignment._id]} 
                      onOpen={() => setSelectedAssignment(assignment)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};

// Styles (igual que antes)
const styles = {
  // ... tus estilos
};

export default LearningPage;