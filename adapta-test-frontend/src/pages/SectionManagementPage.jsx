import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

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
//  SUB-COMPONENTE: Pestaña para Módulos y Contenido
// ===================================================================================
const ModulesTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const { modules, isLoading } = useSelector((state) => state.content);
  const [moduleTitle, setModuleTitle] = useState("");

  useEffect(() => {
    if (sectionId) {
      dispatch(getModulesForSection(sectionId));
    }
    return () => {
      dispatch(resetContent());
    };
  }, [dispatch, sectionId]);

  const handleCreateModule = (e) => {
    e.preventDefault();
    dispatch(
      createAndPublishModuleToSection({
        sectionId,
        moduleData: { title: moduleTitle },
      })
    );
    setModuleTitle("");
  };

  if (isLoading) return <p>Cargando módulos...</p>;

  return (
    <div>
      <section>
        <h2>Módulos del Curso</h2>
        {modules.length > 0 ? (
          modules.map((module) => (
            <ModuleItem key={module._id} module={module} />
          ))
        ) : (
          <p>Este curso aún no tiene módulos publicados.</p>
        )}
      </section>
      <div style={styles.formContainer}>
        <h3>Añadir Nuevo Módulo</h3>
        <form onSubmit={handleCreateModule}>
          <input
            type="text"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Título del nuevo módulo"
            required
            style={styles.input}
          />
          <button type="submit" style={{ marginTop: "10px" }}>
            Crear y Publicar Módulo
          </button>
        </form>
      </div>
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
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (sectionId) dispatch(getAssignmentsForSection(sectionId));
    return () => {
      dispatch(resetAssignments());
    };
  }, [dispatch, sectionId]);

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    dispatch(
      createAssignment({ sectionId, assignmentData: { title, instructions } })
    );
    setTitle("");
    setInstructions("");
  };

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
      <div style={styles.formContainer}>
        <h3>Crear Nueva Tarea</h3>
        <form onSubmit={handleCreateAssignment}>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instrucciones de la tarea..."
              style={{ ...styles.input, height: "80px" }}
            />
          </div>
          <button type="submit">Crear Tarea</button>
        </form>
      </div>
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
    <div>
      {/* --- SECCIÓN 1: Formulario de Configuración --- */}
      <div
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <h3>1. Configurar Criterios de Aprobación</h3>
        <form onSubmit={handleCriteriaSubmit}>
          <fieldset>
            <legend>
              <strong>Nivel de Maestría</strong>
            </legend>
            <input
              type="checkbox"
              id="masteryRequired"
              name="required"
              checked={criteria.mastery?.required || false}
              onChange={handleMasteryChange}
            />
            <label htmlFor="masteryRequired">
              {" "}
              Requerir un nivel de maestría mínimo.
            </label>
            {criteria.mastery?.required && (
              <div style={{ marginTop: "10px", marginLeft: "25px" }}>
                <label htmlFor="minPercentage">Porcentaje mínimo (%): </label>
                <input
                  type="number"
                  id="minPercentage"
                  name="minPercentage"
                  min="1"
                  max="100"
                  value={criteria.mastery?.minPercentage || 85}
                  onChange={handleMasteryChange}
                />
              </div>
            )}
          </fieldset>
          <fieldset style={{ marginTop: "15px" }}>
            <legend>
              <strong>Participación</strong>
            </legend>
            <input
              type="checkbox"
              id="allAssignmentsRequired"
              name="allAssignmentsRequired"
              checked={criteria.completion?.allAssignmentsRequired || false}
              onChange={handleCompletionChange}
            />
            <label htmlFor="allAssignmentsRequired">
              {" "}
              Requerir la entrega de TODAS las tareas.
            </label>
          </fieldset>
          <button type="submit" style={{ marginTop: "15px" }}>
            Guardar Criterios
          </button>
        </form>
      </div>

      {/* --- SECCIÓN 2: Vista Previa y Procesamiento --- */}
      <div style={{ marginTop: "40px" }}>
        <h3>2. Vista Previa y Procesamiento Final</h3>
        <p>
          Esta tabla muestra el cumplimiento de cada estudiante según los
          criterios guardados.
        </p>
        {isLoading ? (
          <p>Cargando vista previa...</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Estudiante
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Criterios Cumplidos
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Estado Final
                </th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((student) => (
                <tr key={student.enrollmentId}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {student.student.name}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {student.checks.map((check, index) => (
                        <li key={index}>
                          <strong>{check.name}:</strong> {check.status}{" "}
                          {check.isMet ? "✅" : "❌"}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      fontWeight: "bold",
                    }}
                  >
                    {student.finalStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          onClick={handleProcessGrades}
          disabled={isLoading}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "1rem",
            background: "darkred",
            color: "white",
          }}
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
    <div>
      <h1>Gestionando: {section.course.title}</h1>
      {section.course.syllabus && (
        <a
          href={`http://localhost:5000${section.course.syllabus}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button style={{ marginBottom: "10px" }}>Ver Sílabus Oficial</button>
        </a>
      )}
      <h3>Sección: {section.sectionCode}</h3>
      <hr />

      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab("modules")}
          style={{
            ...styles.navButton,
            ...(activeTab === "modules" && styles.activeNavButton),
          }}
        >
          Módulos y Contenido
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          style={{
            ...styles.navButton,
            ...(activeTab === "assignments" && styles.activeNavButton),
          }}
        >
          Tareas
        </button>
        <button
          onClick={() => setActiveTab("grading")}
          style={{
            ...styles.navButton,
            ...(activeTab === "grading" && styles.activeNavButton),
          }}
        >
          Criterios de Aprobación
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            ...styles.navButton,
            ...(activeTab === "analytics" && styles.activeNavButton),
          }}
        >
          Analíticas
        </button>
      </nav>

      <div>
        {activeTab === "modules" && <ModulesTab sectionId={section._id} />}
        {activeTab === "assignments" && (
          <AssignmentsTab sectionId={section._id} />
        )}
        {activeTab === "grading" && <FinalGradingTab section={section} />}
        {activeTab === "analytics" && <AnalyticsTab sectionId={section._id} />}
      </div>
    </div>
  );
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
