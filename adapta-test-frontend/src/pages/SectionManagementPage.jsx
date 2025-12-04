import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { BlurFade } from "../components/ui/blur-fade";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Typewriter } from "../components/ui/typewriter-text";
import { ArrowLeft, GraduationCap, Plus, X, Book } from "lucide-react";

// --- Acciones de Redux ---
import {
  getSectionAnalytics,
  reset as resetAnalytics,
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
  getModulesForSection,
  createAndPublishModuleToSection,
  reset as resetContent,
} from "../features/content/contentSlice";
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
import ModuleItem from "../features/content/ModuleItem"; // Asegúrate de que la ruta a ModuleItem es correcta

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
        <button
          onClick={onClose}
          style={modalStyles.closeButton}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
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
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
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
              <Typewriter text={["Crear Nueva Tarea"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Añade una nueva tarea para los estudiantes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Título de la Tarea
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Ejercicio de Variables"
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Instrucciones
                </Label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe lo que los estudiantes deben hacer..."
                  className="w-full px-3 py-2.5 border rounded-lg bg-card text-foreground focus-visible:ring-2 focus-visible:outline-none"
                  rows="4"
                />
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
//  SUB-COMPONENTE: Pestaña para Módulos y Contenido
// ===================================================================================
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Módulos del Curso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el contenido educativo organizado en módulos
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

      {/* Modules List */}
      {modules.length > 0 ? (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <BlurFade key={module._id} delay={0.1 + index * 0.05} inView>
              <Card className="overflow-hidden border border-border hover:border-primary/50 transition-colors duration-200 bg-card">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Module Number Badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>

                    {/* Module Content */}
                    <div className="flex-1 min-w-0">
                      <ModuleItem module={module} />
                    </div>
                  </div>
                </div>
              </Card>
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
                Este curso aún no tiene módulos publicados. Crea el primer módulo para comenzar a estructurar el contenido educativo.
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

      {/* Create Module Modal */}
      <CreateModuleModal
        sectionId={sectionId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

// ===================================================================================
//  SUB-COMPONENTE: Pestaña para Gestionar Tareas
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

  return (
    <div>
      <h2>Gestión de Tareas</h2>
      {isLoading ? (
        <p>Cargando tareas...</p>
      ) : (
        assignments.map((assignment) => (
          <div
            key={assignment._id}
            style={{
              ...styles.card,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4>{assignment.title}</h4>
            <button onClick={() => setViewingSubmissionsFor(assignment)}>
              Ver Entregas
            </button>
          </div>
        ))
      )}

      <div className="mt-6">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Crear Nueva Tarea
        </Button>
      </div>

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
//  SUB-COMPONENTE: Pestaña para Criterios de Aprobación
// ===================================================================================
const FinalGradingTab = ({ section }) => {
  const dispatch = useDispatch();

  // Estado para el formulario de configuración de criterios
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

  // 👇 MANEJADOR COMPLETO: Actualiza el estado de la maestría
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

  // 👇 MANEJADOR COMPLETO: Actualiza el estado de la completitud
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
    dispatch(
      updateApprovalCriteria({ sectionId: section._id, criteriaData: criteria })
    )
      .unwrap()
      .then(() => {
        alert("Criterios guardados. La tabla de vista previa se actualizará.");
        dispatch(getGradingPreview(section._id));
      })
      .catch((error) => alert("Error al guardar: " + error.message));
  };

  const handleProcessGrades = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres procesar las calificaciones finales? Esta acción es definitiva."
      )
    ) {
      dispatch(processSectionGrades(section._id));
    }
  };

  return (
    <div className="space-y-6">
      {/* --- SECCIÓN 1: Formulario de Configuración --- */}
      <div className="border-2 border-dashed border-slate-300 dark:border-zinc-600 p-5 rounded-lg bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          1. Configurar Criterios de Aprobación
        </h3>
        <form onSubmit={handleCriteriaSubmit}>
          <fieldset>
            <legend>
              <strong className="text-foreground">Nivel de Maestría</strong>
            </legend>
            <input
              type="checkbox"
              id="masteryRequired"
              name="required"
              checked={criteria.mastery?.required || false}
              onChange={handleMasteryChange}
              className="cursor-pointer"
            />
            <label
              htmlFor="masteryRequired"
              className="text-foreground ml-2 cursor-pointer"
            >
              {" "}
              Requerir un nivel de maestría mínimo.
            </label>
            {criteria.mastery?.required && (
              <div className="mt-3 ml-6 space-y-2">
                <label
                  htmlFor="minPercentage"
                  className="text-foreground"
                >{`Porcentaje mínimo (%): `}</label>
                <input
                  type="number"
                  id="minPercentage"
                  name="minPercentage"
                  min="1"
                  max="100"
                  value={criteria.mastery?.minPercentage || 85}
                  onChange={handleMasteryChange}
                  className="px-2 py-1 border rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </fieldset>
          <fieldset className="mt-4">
            <legend>
              <strong className="text-foreground">Participación</strong>
            </legend>
            <input
              type="checkbox"
              id="allAssignmentsRequired"
              name="allAssignmentsRequired"
              checked={criteria.completion?.allAssignmentsRequired || false}
              onChange={handleCompletionChange}
              className="cursor-pointer"
            />
            <label
              htmlFor="allAssignmentsRequired"
              className="text-foreground ml-2 cursor-pointer"
            >
              {" "}
              Requerir la entrega de TODAS las tareas.
            </label>
          </fieldset>
          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-90 transition">
            Guardar Criterios
          </button>
        </form>
      </div>

      {/* --- SECCIÓN 2: Vista Previa y Procesamiento --- */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          2. Vista Previa y Procesamiento Final
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Esta tabla muestra el cumplimiento de cada estudiante según los
          criterios guardados.
        </p>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando vista previa...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-800">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-slate-200 dark:border-zinc-700">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-slate-200 dark:border-zinc-700">
                    Criterios Cumplidos
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-slate-200 dark:border-zinc-700">
                    Estado Final
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((student) => (
                  <tr key={student.enrollmentId} className="border-b border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {student.student.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <ul className="list-disc list-inside space-y-1">
                        {student.checks.map((check, index) => (
                          <li key={index} className="text-muted-foreground">
                            <strong>{check.name}:</strong> {check.status}{" "}
                            {check.isMet ? "✅" : "❌"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">
                      {student.finalStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={handleProcessGrades}
          disabled={isLoading}
          className="mt-6 px-4 py-2 bg-destructive text-primary-foreground rounded-lg hover:brightness-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Procesando..." : "Procesar Calificaciones Finales"}
        </button>
      </div>
    </div>
  );
};

// ===================================================================================
//  NUEVO SUB-COMPONENTE: Pestaña para Analíticas de Rendimiento
// ===================================================================================
const AnalyticsTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const { analyticsData, isLoading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(getSectionAnalytics(sectionId));
    return () => {
      dispatch(resetAnalytics());
    };
  }, [dispatch, sectionId]);

  if (isLoading || !analyticsData) {
    return <p>Calculando analíticas de la sección...</p>;
  }

  const { masteryByModule, difficultQuestions, strugglingStudents } =
    analyticsData;

  return (
    <div>
      <h2>Analíticas de Rendimiento</h2>

      {/* Sección de Maestría por Módulo */}
      <div style={styles.card}>
        <h3>Maestría Promedio por Módulo</h3>
        {masteryByModule.map((item) => (
          <div key={item.moduleId}>
            <p>
              {item.moduleTitle}: <strong>{item.averageMastery}%</strong>
            </p>
          </div>
        ))}
      </div>

      {/* Sección de Estudiantes con Dificultades */}
      <div style={styles.card}>
        <h3>Estudiantes que Requieren Atención</h3>
        {strugglingStudents.length > 0 ? (
          <ul>
            {strugglingStudents.map((item) => (
              <li key={item._id}>
                <strong>{item.student.name}</strong> tiene una maestría baja (
                {item.highestMasteryScore}%) en el módulo "
                <em>{item.module.title}</em>".
              </li>
            ))}
          </ul>
        ) : (
          <p>
            ¡Excelente! Ningún estudiante muestra un nivel de maestría crítico
            por ahora.
          </p>
        )}
      </div>

      {/* Sección de Preguntas Difíciles (simplificado) */}
      <div style={styles.card}>
        <h3>Preguntas con Mayor Tasa de Error (Top 3)</h3>
        <p>
          (Funcionalidad en desarrollo: Próximamente se mostrará el texto de la
          pregunta)
        </p>
        <ul>
          {difficultQuestions.map(([questionId, count]) => (
            <li key={questionId}>
              Pregunta ID {questionId} - Fallada {count} veces.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

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
    // El objeto 'assignment' que recibimos como prop ya contiene el ID de su sección.
    if (assignment?.section && assignment?._id) {
      // Despachamos la acción con el objeto que contiene ambos IDs
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
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, width: "90%", maxWidth: "800px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Entregas para: {assignment.title}</h2>
          <button onClick={onClose} style={{ height: "40px" }}>
            Cerrar
          </button>
        </div>
        <hr />
        {isLoading ? (
          <p>Cargando entregas...</p>
        ) : submissions.length > 0 ? (
          submissions.map((sub) => (
            <div key={sub._id} style={styles.card}>
              <p>
                <strong>Estudiante:</strong> {sub.student.name} (
                {sub.student.email})
              </p>
              <p>
                <strong>Respuesta:</strong>
              </p>
              <p
                style={{
                  background: "#f4f4f4",
                  padding: "10px",
                  borderRadius: "5px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {sub.content}
              </p>

              {currentSubmissionId === sub._id ? (
                <div style={{ marginTop: "15px" }}>
                  <input
                    type="number"
                    placeholder="Nota (ej. 15)"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  <textarea
                    placeholder="Feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{ width: "100%", height: "60px", marginTop: "10px" }}
                  ></textarea>
                  <button
                    onClick={() => handleGrade(sub._id)}
                    style={{ marginTop: "10px" }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setCurrentSubmissionId(null)}
                    style={{ marginLeft: "10px" }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "15px" }}>
                  <p>
                    <strong>Calificación:</strong>{" "}
                    {sub.grade != null ? sub.grade : "Sin calificar"}
                  </p>
                  <p>
                    <strong>Feedback:</strong> {sub.feedback || "Sin feedback"}
                  </p>
                  <button onClick={() => openGradingForm(sub)}>
                    {sub.grade != null ? "Editar Calificación" : "Calificar"}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Aún no hay entregas para esta tarea.</p>
        )}
      </div>
    </div>
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: Página de Gestión de Sección
// ===================================================================================
const SectionManagementPage = () => {
  const { id: sectionId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("modules");
  const { section, isLoading: isLoadingSection } = useSelector(
    (state) => state.learning
  );

  useEffect(() => {
    dispatch(getSectionDetails(sectionId));
    return () => {
      dispatch(resetLearning());
    };
  }, [dispatch, sectionId]);

  if (isLoadingSection || !section) {
    return <h1>Cargando datos de la sección...</h1>;
  }

  return (
    <div className="container mx-auto px-2 py-2">
      <BlurFade inView delay={0.1}>
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="bg-card/50 p-2.5 rounded-lg flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                Gestionando: {section.course.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sección {section.sectionCode} • Prof.{" "}
                {section.instructor?.name || "-"}
              </p>
              {section.course?.syllabus && (
                <a
                  href={`http://localhost:5000${section.course.syllabus}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-block mt-2"
                >
                  Ver Sílabus Oficial
                </a>
              )}
            </div>
          </div>
        </div>
      </BlurFade>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "modules"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Módulos y Contenido
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "assignments"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Tareas
          </button>
          <button
            onClick={() => setActiveTab("grading")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "grading"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Criterios de Aprobación
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Analíticas
          </button>
        </div>
      </div>

      <div>
        {activeTab === "modules" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Módulos y Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <ModulesTab sectionId={section._id} />
            </CardContent>
          </Card>
        )}

        {activeTab === "assignments" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Gestión de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsTab sectionId={section._id} />
            </CardContent>
          </Card>
        )}

        {activeTab === "grading" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Criterios de Aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              <FinalGradingTab section={section} />
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Analíticas</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsTab sectionId={section._id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// --- Estilos del Modal ---
const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1009,
    backdropFilter: "blur(2px)",
  },

  modalContent: {
    position: "relative",
    backgroundColor: "transparent",
    borderRadius: "20px",
    padding: "20px",
    width: "90%",
    maxWidth: "480px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0px 8px 25px rgba(0,0,0,0.22)",
    zIndex: 10000,
  },

  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
  },
};

// --- Estilos ---
const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "5px",
  },
  formContainer: {
    border: "2px dashed #ccc",
    padding: "20px",
    marginTop: "30px",
    borderRadius: "5px",
  },
  formGroup: { marginBottom: "15px" },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    boxSizing: "border-box",
  },
  nav: {
    marginBottom: "20px",
    borderBottom: "1px solid #ccc",
    paddingBottom: "10px",
  },
  navButton: {
    marginRight: "10px",
    padding: "8px 12px",
    border: "1px solid transparent",
    background: "none",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },
  activeNavButton: { fontWeight: "bold", borderBottom: "2px solid #007bff" },
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
    maxWidth: "800px",
    position: "relative",
  },
};

export default SectionManagementPage;
