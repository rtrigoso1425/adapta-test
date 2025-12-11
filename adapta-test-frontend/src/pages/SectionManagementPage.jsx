import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { BlurFade } from "../components/ui/blur-fade";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Typewriter } from "../components/ui/typewriter-text";
import { 
  ArrowLeft, GraduationCap, Plus, X, Book, FileText, ChevronDown, ChevronUp, 
  BarChart3, Users, AlertCircle, CheckCircle2, Trophy, Eye, Settings 
} from "lucide-react";

import {
  createLessonInModule,
  getModulesForSection,
  createAndPublishModuleToSection,
  reset as resetContent,
  getLessonsForModule,
} from "../features/content/contentSlice";
import {
  getQuestionsForModule,
  createQuestion,
} from "../features/questions/questionSlice";
import { 
  getSectionAnalytics, 
  reset as resetAnalytics,
  selectEnrichedAnalytics
} from "../features/analytics/analyticsSlice";
import {
  getGradingPreview,
  processSectionGrades,
  reset as resetGrading,
} from "../features/grading/gradingSlice";
import {
  getSectionDetails,
  reset as resetLearning,
} from "../features/learning/learningSlice";
import {
  getAssignmentsForSection,
  createAssignment,
  reset as resetAssignments,
} from "../features/assignments/assignmentSlice";
import {
  getSubmissionsForAssignment,
  gradeSubmission,
  reset as resetSubmissions,
} from "../features/submissions/submissionSlice";
import { updateApprovalCriteria } from "../features/sections/sectionSlice";
import { useValidateId } from '../hooks/useValidateId';

const EMPTY_ARRAY = [];

// ===================================================================================
//  SUB-COMPONENTE: Modal para Ver y Calificar Entregas
// ===================================================================================
const SubmissionsViewerModal = ({ assignment, onClose }) => {
  const dispatch = useDispatch();
  const { submissions, isLoading } = useSelector((state) => state.submissions);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);

  useEffect(() => {
    if (assignment?.section && assignment?._id) {
      dispatch(
        getSubmissionsForAssignment({
          sectionId: assignment.section,
          assignmentId: assignment._id,
        })
      );
    }
    return () => {
      dispatch(resetSubmissions());
    };
  }, [dispatch, assignment]);

  const handleGrade = (submissionId) => {
    const gradeData = { grade: Number(grade), feedback };
    dispatch(gradeSubmission({ submissionId, gradeData }));
    setCurrentSubmissionId(null);
  };

  const openGradingForm = (submission) => {
    setCurrentSubmissionId(submission._id);
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
  };

  return (
    <ModalOverlay isOpen={true} onClose={onClose}>
      <div className="w-full max-w-3xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Entregas: {assignment.title}
            </h2>
            <p className="text-sm text-muted-foreground">Revisión y calificación de estudiantes</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-10 space-y-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               <p className="text-muted-foreground">Cargando entregas...</p>
             </div>
          ) : submissions.length > 0 ? (
            submissions.map((sub) => (
              <Card key={sub._id} className="border border-border bg-card/50">
                <CardHeader className="pb-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{sub.student.name}</h4>
                        <p className="text-xs text-muted-foreground">{sub.student.email}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${sub.grade != null ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                        {sub.grade != null ? `Nota: ${sub.grade}` : "Pendiente"}
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg text-sm border border-border/50">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Respuesta del estudiante:</p>
                    <p className="whitespace-pre-wrap">{sub.content}</p>
                  </div>

                  {/* Formulario de calificación */}
                  {currentSubmissionId === sub._id ? (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                          <Label className="text-xs">Nota (0-20)</Label>
                          <Input
                            type="number"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="bg-card"
                            autoFocus
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs">Feedback</Label>
                          <Input
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Excelente trabajo..."
                            className="bg-card"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setCurrentSubmissionId(null)}>Cancelar</Button>
                        <Button size="sm" onClick={() => handleGrade(sub._id)}>Guardar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-sm text-muted-foreground italic">
                        {sub.feedback ? `Feedback: "${sub.feedback}"` : "Sin feedback aun."}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => openGradingForm(sub)}>
                        {sub.grade != null ? "Editar Nota" : "Calificar"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No hay entregas recibidas para esta tarea.</p>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Modal para Crear Tarea
// ===================================================================================
const CreateAssignmentModal = ({ sectionId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const { isLoading } = useSelector((state) => state.assignments);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      dispatch(
        createAssignment({ sectionId, assignmentData: { title, instructions } })
      );
      setTitle("");
      setInstructions("");
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Nueva Tarea"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Asigna trabajo práctico a los estudiantes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Ensayo sobre Historia"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Instrucciones</Label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Detalla los requerimientos..."
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onClose} className="w-full">Cancelar</Button>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creando..." : "Crear Tarea"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  PESTAÑA: GESTIÓN DE TAREAS (Estilizada)
// ===================================================================================
const AssignmentsTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const { assignments, isLoading } = useSelector((state) => state.assignments);
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (sectionId) dispatch(getAssignmentsForSection(sectionId));
    return () => {
      dispatch(resetAssignments());
    };
  }, [dispatch, sectionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tareas Asignadas</h2>
          <p className="text-sm text-muted-foreground">Gestiona y evalúa las actividades de los estudiantes</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Nueva Tarea
        </Button>
      </div>

      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment, index) => (
            <BlurFade key={assignment._id} delay={0.1 + index * 0.05} inView>
              <Card className="h-full flex flex-col hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    <FileText size={20} />
                  </div>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {assignment.instructions || "Sin instrucciones detalladas."}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border">
                  <Button 
                    variant="ghost" 
                    className="w-full group" 
                    onClick={() => setViewingSubmissionsFor(assignment)}
                  >
                    Ver Entregas 
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </BlurFade>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
             </div>
             <h3 className="text-lg font-semibold mb-2">No hay tareas creadas</h3>
             <p className="text-muted-foreground mb-6 max-w-sm">
               Crea tareas para que tus estudiantes puedan subir sus trabajos y recibir retroalimentación.
             </p>
             <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
               Crear primera tarea
             </Button>
          </div>
        </Card>
      )}

      <CreateAssignmentModal
        sectionId={sectionId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {viewingSubmissionsFor && (
        <SubmissionsViewerModal
          assignment={viewingSubmissionsFor}
          onClose={() => setViewingSubmissionsFor(null)}
        />
      )}
    </div>
  );
};

// ===================================================================================
//  PESTAÑA: CRITERIOS DE APROBACIÓN (Estilizada)
// ===================================================================================
const FinalGradingTab = ({ section }) => {
  const dispatch = useDispatch();

  const [criteria, setCriteria] = useState(
    section.approvalCriteria || {
      mastery: { required: false, minPercentage: 85 },
      completion: { allAssignmentsRequired: false },
    }
  );

  const { previewData, isLoading } = useSelector((state) => state.grading);

  useEffect(() => {
    dispatch(getGradingPreview(section._id));
    return () => {
      dispatch(resetGrading());
    };
  }, [dispatch, section._id]);

  const handleMasteryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCriteria((prev) => ({
      ...prev,
      mastery: {
        ...prev.mastery,
        [name]: type === "checkbox" ? checked : Number(value),
      },
    }));
  };

  const handleCompletionChange = (e) => {
    const { name, checked } = e.target;
    setCriteria((prev) => ({
      ...prev,
      completion: {
        ...prev.completion,
        [name]: checked,
      },
    }));
  };

  const handleCriteriaSubmit = (e) => {
    e.preventDefault();
    dispatch(updateApprovalCriteria({ sectionId: section._id, criteriaData: criteria }))
      .unwrap()
      .then(() => {
        dispatch(getGradingPreview(section._id));
      })
      .catch((error) => alert(error.message));
  };

  const handleProcessGrades = () => {
    if (confirm("¿Confirmar cierre de actas y procesar notas finales?")) {
      dispatch(processSectionGrades(section._id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Configuración */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Configuración
            </CardTitle>
            <CardDescription>Reglas para aprobar el curso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCriteriaSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-base">Maestría</Label>
                  <Book className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-3">
                     <input
                      type="checkbox"
                      id="masteryRequired"
                      name="required"
                      checked={criteria.mastery?.required || false}
                      onChange={handleMasteryChange}
                      className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <Label htmlFor="masteryRequired" className="cursor-pointer font-normal">Requerir nota mínima</Label>
                  </div>
                  
                  {criteria.mastery?.required && (
                    <div className="pl-7 animate-in slide-in-from-top-2 duration-200">
                      <Label className="text-xs text-muted-foreground mb-1 block">Porcentaje Mínimo (%)</Label>
                      <Input
                        type="number"
                        name="minPercentage"
                        min="1"
                        max="100"
                        value={criteria.mastery?.minPercentage || 85}
                        onChange={handleMasteryChange}
                        className="h-8"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-base">Participación</Label>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                     <input
                      type="checkbox"
                      id="allAssignmentsRequired"
                      name="allAssignmentsRequired"
                      checked={criteria.completion?.allAssignmentsRequired || false}
                      onChange={handleCompletionChange}
                      className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <Label htmlFor="allAssignmentsRequired" className="cursor-pointer font-normal">
                      Exigir todas las tareas
                    </Label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Guardar Reglas
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha: Vista Previa */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-primary" />
              Vista Previa de Aprobación
            </CardTitle>
            <CardDescription>Simulación basada en los criterios actuales</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-muted-foreground">Calculando...</p>
                </div>
             ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium">Estudiante</th>
                        <th className="px-4 py-3 text-left font-medium">Cumplimiento</th>
                        <th className="px-4 py-3 text-right font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.map((student) => (
                        <tr key={student.enrollmentId} className="bg-card hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{student.student.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {student.checks.map((check, i) => (
                                <span key={i} className={`text-xs flex items-center gap-1.5 ${check.isMet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {check.isMet ? <CheckCircle2 size={12}/> : <X size={12}/>}
                                  {check.name}: {check.status}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               student.finalStatus === "Aprobado" 
                               ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                               : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                             }`}>
                               {student.finalStatus}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             )}
          </CardContent>
          <CardFooter className="bg-muted/10 border-t pt-4">
             <Button 
                variant="destructive" 
                onClick={handleProcessGrades} 
                disabled={isLoading}
                className="w-full sm:w-auto ml-auto"
             >
               {isLoading ? "Procesando..." : "Cerrar Actas Oficialmente"}
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// ===================================================================================
//  PESTAÑA: ANALÍTICAS (Estilizada)
// ===================================================================================
const AnalyticsTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const analyticsData = useSelector(selectEnrichedAnalytics);
  const { isLoading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(getSectionAnalytics(sectionId));
    return () => {
      dispatch(resetAnalytics());
    };
  }, [dispatch, sectionId]);

  if (isLoading || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
         <p className="text-muted-foreground animate-pulse">Analizando datos del curso...</p>
      </div>
    );
  }

  const { masteryByModule, difficultQuestions, strugglingStudents } = analyticsData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Maestría por Módulo */}
        <BlurFade delay={0.1} inView>
          <Card className="h-full border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="w-4 h-4" /> Rendimiento Promedio
              </CardTitle>
              <h3 className="text-2xl font-bold text-foreground">Por Módulo</h3>
            </CardHeader>
            <CardContent>
               <div className="space-y-4 mt-2">
                  {masteryByModule.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{item.moduleTitle}</span>
                        <span>{item.averageMastery}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${item.averageMastery}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {masteryByModule.length === 0 && <p className="text-sm text-muted-foreground italic">No hay datos suficientes.</p>}
               </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Card 2: Alumnos en Riesgo */}
        <BlurFade delay={0.2} inView>
          <Card className="h-full border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-red-500" /> Atención Requerida
              </CardTitle>
              <h3 className="text-2xl font-bold text-foreground">Alumnos en Riesgo</h3>
            </CardHeader>
            <CardContent>
              {strugglingStudents.length > 0 ? (
                <ul className="space-y-3 mt-2">
                  {strugglingStudents.map((item) => (
                    <li key={item._id} className="flex items-start gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {item.highestMasteryScore}%
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.student.name}</p>
                        <p className="text-xs text-muted-foreground">Bajo rendimiento en: {item.module.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">¡Excelente! Ningún alumno está en nivel crítico actualmente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Card 3: Preguntas Difíciles */}
        <BlurFade delay={0.3} inView>
          <Card className="h-full border-l-4 border-l-yellow-500 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-4 h-4 text-yellow-500" /> Puntos de Dolor
              </CardTitle>
              <h3 className="text-2xl font-bold text-foreground">Preguntas Difíciles</h3>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[300px] pr-2">
               <div className="mt-2 space-y-3">
                 {difficultQuestions.length > 0 ? difficultQuestions.map(([questionItem, count], idx) => {
                   // Lógica de seguridad:
                   // Verifica si 'questionItem' es un objeto con texto (como en tu referencia) o solo un ID
                   const isPopulated = typeof questionItem === 'object' && questionItem !== null;
                   const text = isPopulated ? questionItem.questionText : "Texto no disponible (Solo ID)";
                   const id = isPopulated ? questionItem._id : questionItem;

                   return (
                     <div key={isPopulated ? id : idx} className="group flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/70 transition-colors">
                        {/* Ranking Badge */}
                        <div className="flex flex-col items-center justify-start pt-1">
                           <span className="flex items-center justify-center w-6 h-6 rounded-full bg-background border text-xs font-bold text-muted-foreground shadow-sm">
                             #{idx + 1}
                           </span>
                        </div>
                        
                        {/* Contenido Texto */}
                        <div className="flex-1 min-w-0">
                          {/* Muestra el texto de la pregunta (limitado a 3 líneas) */}
                          <p className="text-sm font-medium text-foreground line-clamp-3 leading-snug" title={isPopulated ? text : ""}>
                             {isPopulated ? text : `ID: ${String(id).slice(-8)}...`}
                          </p>
                          
                          {/* Metadatos: ID y Contador de fallos */}
                          <div className="flex items-center justify-between mt-2">
                             <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[80px]">
                               ID: {String(id).slice(-6)}
                             </span>
                             <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                                <AlertCircle size={10} className="text-red-600 dark:text-red-400" />
                                <span className="text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                                  {count} fallos
                                </span>
                             </div>
                          </div>
                        </div>
                     </div>
                   );
                 }) : (
                   <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60">
                     <Trophy className="w-10 h-10 text-muted-foreground/30 mb-2" />
                     <p className="text-sm text-muted-foreground italic">
                       No hay suficientes datos de errores para mostrar estadísticas.
                     </p>
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
        </BlurFade>

      </div>
    </div>
  );
};

// ===================================================================================
//  MODAL OVERLAY COMPONENT (reutilizable)
// ===================================================================================
const ModalOverlay = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div style={modalStyles.overlay} onClick={onClose}>
      <div
        style={modalStyles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Eliminado el botón X absoluto aquí porque ya lo controlamos dentro de los modales más complejos */}
        {children}
      </div>
    </div>,
    document.body
  );
};

// ===================================================================================
//  COMPONENTE: Modal para Crear Módulo
// ===================================================================================
const CreateModuleModal = ({ sectionId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [moduleTitle, setModuleTitle] = useState("");
  const { isLoading } = useSelector((state) => state.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (moduleTitle.trim()) {
      dispatch(
        createAndPublishModuleToSection({
          sectionId,
          moduleData: { title: moduleTitle },
        })
      );
      setModuleTitle("");
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4">
            <div className="absolute top-4 right-4">
               <Button variant="ghost" size="icon" onClick={onClose}><X size={18}/></Button>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Crear Nuevo Módulo"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Añade un nuevo módulo a esta sección
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Título del Módulo
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2 ring-primary/20">
                  <Input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="Ej. Introducción a JavaScript"
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="w-full py-2"
                >
                  {isLoading ? "Creando..." : "Crear Módulo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Modal para Crear Lección
// ===================================================================================
const CreateLessonModal = ({ moduleId, isOpen, onClose, onLessonCreated }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.content);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text"); 
  const [fileUrl, setFileUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const lessonData = {
        title,
        content,
        contentType, 
        fileUrl: fileUrl.trim() || null,
      };

      await dispatch(createLessonInModule({ moduleId, lessonData })).unwrap();

      if (onLessonCreated) onLessonCreated();

      setTitle("");
      setContent("");
      setContentType("text");
      setFileUrl("");
      onClose();

    } catch (error) {
      console.error("Error creando lección:", error);
      const msg = error?.message || "Error desconocido";
      alert(`Error del servidor: ${msg}`);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4 relative">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0"><X size={18}/></Button>
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Crear Nueva Lección"]} speed={150} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Introducción a React"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Recurso</Label>
                <Select
                  value={contentType}
                  onValueChange={(val) => setContentType(val)}
                >
                  <SelectTrigger className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Solo Texto</SelectItem>
                    <SelectItem value="video_url">Video (URL)</SelectItem>
                    <SelectItem value="document_url">Documento (PDF/Word)</SelectItem>
                    <SelectItem value="slides_url">Presentación (Slides)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descripción / Contenido</Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg bg-background text-foreground min-h-[100px] text-sm"
                  required
                />
              </div>

              {contentType !== "text" && (
                <div className="space-y-2">
                  <Label>Enlace del Recurso</Label>
                  <Input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="default" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Crear Lección"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Modal para Crear Pregunta
// ===================================================================================
const CreateQuestionModal = ({ moduleId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.questions);
  
  const [questionText, setQuestionText] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState(1); // nivel 1-5

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const rawOptions = optionsText
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      if (rawOptions.length < 2) throw new Error("Mínimo 2 opciones requeridas.");
      if (correctIndex >= rawOptions.length) throw new Error("Selección correcta inválida.");

      // Validar dificultad entre 1 y 5
      const lvl = Number(difficulty);
      if (!Number.isInteger(lvl) || lvl < 1 || lvl > 5) {
        throw new Error("La dificultad debe ser un número entero entre 1 y 5.");
      }

      const formattedOptions = rawOptions.map((text, index) => ({
        text: text,
        isCorrect: index === correctIndex
      }));

      const questionData = {
        questionText,
        options: formattedOptions,
        difficulty: lvl,
      };

      await dispatch(createQuestion({ moduleId, questionData })).unwrap();

      setQuestionText("");
      setOptionsText("");
      setCorrectIndex(0);
      setDifficulty(1);
      onClose();

    } catch (error) {
      console.error("Error creando pregunta:", error);
      const msg = error?.message || (typeof error === 'string' ? error : "Error desconocido");
      alert(`Error del servidor: ${msg}`);
    }
  };

  const currentOptions = optionsText
    .split("\n")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4 relative">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0"><X size={18}/></Button>
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Nueva Pregunta"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Agrega una pregunta al banco del módulo
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Enunciado</Label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="¿Cuál es la capital de Perú?"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-background text-foreground min-h-[80px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Opciones (una por línea)</Label>
                <textarea
                  value={optionsText}
                  onChange={(e) => {
                    setOptionsText(e.target.value);
                    // Ajustar correctIndex si queda fuera de rango
                    const opts = e.target.value.split("\n").map(o => o.trim()).filter(Boolean);
                    if (correctIndex >= opts.length) setCorrectIndex(Math.max(0, opts.length - 1));
                  }}
                  placeholder={"Lima\nArequipa\nCusco"}
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-background text-foreground min-h-[100px] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Respuesta Correcta</Label>
                  <select
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm"
                  >
                    {currentOptions.length > 0 ? (
                      currentOptions.map((opt, idx) => (
                        <option key={idx} value={idx}>
                          {idx + 1}. {opt}
                        </option>
                      ))
                    ) : (
                      <option disabled>Escribe opciones primero...</option>
                    )}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Dificultad (1-5)</Label>
                  <Select
                    value={String(difficulty)}
                    onValueChange={(val) => setDifficulty(Number(val))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Fácil</SelectItem>
                      <SelectItem value="2">2 - Fácil</SelectItem>
                      <SelectItem value="3">3 - Intermedio</SelectItem>
                      <SelectItem value="4">4 - Difícil</SelectItem>
                      <SelectItem value="5">5 - Muy Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Crear Pregunta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Item de Módulo (Igual que antes)
// ===================================================================================
const ModuleItemWithLessons = ({ module, index }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);

  const lessonsFromStore = useSelector((state) => 
    state.content?.lessonsByModule?.[module._id] || EMPTY_ARRAY
  );
  const isLoadingLessons = useSelector((state) => state.content?.loadingLessons?.[module._id]) || false;

  const { questionsByModule, isLoading: isLoadingQuestions } = useSelector((state) => state.questions);
  const questions = questionsByModule[module._id] || [];

  const handleToggleExpand = () => {
    if (!isExpanded) {
      dispatch(getLessonsForModule(module._id));
      if (!questionsByModule[module._id]) {
        dispatch(getQuestionsForModule(module._id));
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleLessonCreated = () => {
    dispatch(getLessonsForModule(module._id));
  };

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-colors duration-200 bg-card">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{index + 1}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateLessonOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  Lección
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isExpanded ? "Ocultar" : "Ver"} Contenido
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Lecciones */}
                <div className="pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-primary" />
                    <h4 className="font-medium text-foreground">Lecciones</h4>
                  </div>
                  {isLoadingLessons ? (
                     <p className="text-sm text-muted-foreground pl-4">Cargando lecciones...</p>
                  ) : lessonsFromStore.length > 0 ? (
                    <div className="space-y-3 pl-4">
                      {lessonsFromStore.map((lesson) => (
                        <div key={lesson._id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <FileText size={14} className="text-primary mt-1" />
                          <div>
                            <h5 className="font-medium text-sm">{lesson.title}</h5>
                            <p className="text-xs text-muted-foreground">{lesson.contentType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-4">No hay lecciones.</p>
                  )}
                </div>

                {/* Preguntas */}
                <div className="pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Book size={16} className="text-primary" />
                    <h4 className="font-medium text-foreground">Banco de Preguntas</h4>
                  </div>

                  {isLoadingQuestions && !questions.length ? (
                    <div className="pl-4 space-y-2">
                        <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                    </div>
                  ) : questions.length > 0 ? (
                    <div className="space-y-2 pl-4">
                      {questions.map((question) => (
                        <div
                          key={question._id}
                          className="p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors"
                        >
                          <p className="text-sm text-foreground">{question.questionText}</p>
                           <div className="mt-1 text-xs text-muted-foreground">
                              Correcta: {question.options?.find(o => o.isCorrect)?.text || "N/A"}
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic pl-4">
                      No hay preguntas aún
                    </p>
                  )}

                  <div className="pt-3 pl-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsCreateQuestionOpen(true)}
                      className="w-full border-dashed hover:border-solid"
                    >
                      <Plus size={14} className="mr-2" />
                      Añadir Pregunta
                    </Button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      <CreateLessonModal
        moduleId={module._id}
        isOpen={isCreateLessonOpen}
        onClose={() => setIsCreateLessonOpen(false)}
        onLessonCreated={handleLessonCreated}
      />

      <CreateQuestionModal
        moduleId={module._id}
        isOpen={isCreateQuestionOpen}
        onClose={() => setIsCreateQuestionOpen(false)}
      />
    </Card>
  );
};

const ModulesTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const { modules, isLoading } = useSelector((state) => state.content);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (sectionId) {
      dispatch(getModulesForSection(sectionId));
    }
    return () => {
      dispatch(resetContent());
    };
  }, [dispatch, sectionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Módulos del Curso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el contenido educativo organizado en módulos y lecciones
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus size={18} />
          Nuevo Módulo
        </Button>
      </div>

      {modules.length > 0 ? (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <BlurFade key={module._id} delay={0.1 + index * 0.05} inView>
              <ModuleItemWithLessons module={module} index={index} />
            </BlurFade>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-muted/30 border-2 border-dashed border-muted-foreground/25">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Book className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay módulos aún
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este curso aún no tiene módulos publicados. Crea el primer módulo.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="default"
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Crear Primer Módulo
              </Button>
            </div>
          </div>
        </Card>
      )}

      <CreateModuleModal
        sectionId={sectionId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: Página de Gestión de Sección
// ===================================================================================
const SectionManagementPage = () => {
  const { id: sectionId } = useParams();
  const isValidId = useValidateId(sectionId); // ← Validar ID
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("modules");
  const { section, isLoading: isLoadingSection } = useSelector(
    (state) => state.learning
  );

  useEffect(() => {
    if (isValidId) {
      dispatch(getSectionDetails(sectionId));
    }
    return () => {
      dispatch(resetLearning());
    };
  }, [dispatch, sectionId, isValidId]);

  if (isLoadingSection || !section) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <BlurFade inView delay={0.1}>
        <div className="mb-8">
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row items-start gap-6 border-b pb-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-2xl flex-shrink-0 border border-primary/10">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {section.course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                   <Users size={14}/> Sección {section.sectionCode}
                </span>
                <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                   <GraduationCap size={14}/> Prof. {section.instructor?.name || "-"}
                </span>
                {section.course?.syllabus && (
                  <a
                    href={`http://localhost:5000${section.course.syllabus}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <FileText size={14} /> Ver Sílabus
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </BlurFade>

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-1 min-w-max border-b border-border">
          {[
            { id: "modules", label: "Contenido", icon: Book },
            { id: "assignments", label: "Tareas", icon: FileText },
            { id: "grading", label: "Aprobación", icon: Settings },
            { id: "analytics", label: "Analíticas", icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "modules" && <ModulesTab sectionId={section._id} />}
        {activeTab === "assignments" && <AssignmentsTab sectionId={section._id} />}
        {activeTab === "grading" && <FinalGradingTab section={section} />}
        {activeTab === "analytics" && <AnalyticsTab sectionId={section._id} />}
      </div>
    </div>
  );
};

// --- Estilos Base para Modal Overlay ---
const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    position: "relative",
    width: "100%",
    maxWidth: "fit-content",
    display: "flex",
    justifyContent: "center",
  }
};

export default SectionManagementPage;