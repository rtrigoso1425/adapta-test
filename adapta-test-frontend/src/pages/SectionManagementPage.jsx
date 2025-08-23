import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

// --- Acciones de Redux ---
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
const ApprovalCriteriaTab = ({ section }) => {
  const dispatch = useDispatch();
  const [criteria, setCriteria] = useState(
    section.approvalCriteria || {
      mastery: { required: false, minPercentage: 85 },
      completion: {
        requiredLessonsPercentage: 95,
        allAssignmentsRequired: false,
      },
    }
  );

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
      completion: { ...prev.completion, [name]: checked },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateApprovalCriteria({ sectionId: section._id, criteriaData: criteria })
    )
      .unwrap()
      .then(() => alert("Criterios de aprobación guardados exitosamente."))
      .catch((error) =>
        alert("Error al guardar los criterios: " + error.message)
      );
  };

  return (
    <div>
      <h2>Configurar Criterios de Aprobación</h2>
      <form onSubmit={handleSubmit}>
        <fieldset style={{ marginTop: "20px" }}>
          <legend>
            <strong>Pilar 1: Nivel de Maestría</strong>
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
            Requerir un nivel de maestría mínimo en todos los temas.
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
        <fieldset style={{ marginTop: "20px" }}>
          <legend>
            <strong>Pilar 2: Completitud y Participación</strong>
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
        <button type="submit" style={{ marginTop: "20px" }}>
          Guardar Criterios
        </button>
      </form>
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
          onClick={() => setActiveTab("criteria")}
          style={{
            ...styles.navButton,
            ...(activeTab === "criteria" && styles.activeNavButton),
          }}
        >
          Criterios de Aprobación
        </button>
      </nav>

      <div>
        {activeTab === "modules" && <ModulesTab sectionId={section._id} />}
        {activeTab === "assignments" && (
          <AssignmentsTab sectionId={section._id} />
        )}
        {activeTab === "criteria" && <ApprovalCriteriaTab section={section} />}
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
