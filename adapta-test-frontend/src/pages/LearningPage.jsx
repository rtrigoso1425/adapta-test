import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

// --- Acciones de Redux ---
import {
  getSectionDetails,
  reset as resetLearning,
} from "../features/learning/learningSlice";
import {
  getModulesForSection,
  reset as resetContent,
} from "../features/content/contentSlice";
import {
  getAssignmentsForSection,
  reset as resetAssignments,
} from "../features/assignments/assignmentSlice";
import {
  createSubmission,
  reset as resetSubmissions,
  getMySubmission,
} from "../features/submissions/submissionSlice";

// --- Componentes ---
import ModuleItem from "../features/content/ModuleItem";

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
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Selectores de Redux
  const { section, isLoading: isLoadingSection } = useSelector(
    (state) => state.learning
  );
  const { modules, isLoading: isLoadingModules } = useSelector(
    (state) => state.content
  );
  const { assignments, isLoading: isLoadingAssignments } = useSelector(
    (state) => state.assignments
  );

  useEffect(() => {
    // Cargar todos los datos necesarios para la página
    dispatch(getSectionDetails(sectionId));
    dispatch(getModulesForSection(sectionId));
    dispatch(getAssignmentsForSection(sectionId));

    // Limpiar todos los estados al salir de la página
    return () => {
      dispatch(resetLearning());
      dispatch(resetContent());
      dispatch(resetAssignments());
      dispatch(resetSubmissions());
    };
  }, [dispatch, sectionId]);

  if (isLoadingSection || !section) return <h1>Cargando curso...</h1>;

  return (
    <div>
      <h1>{section.course.title}</h1>
      {section.course.syllabus && (
        <a
          href={`http://localhost:5000${section.course.syllabus}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button style={{ marginBottom: "10px" }}>
            Ver Sílabus del Curso
          </button>
        </a>
      )}
      <p>
        Sección <strong>{section.sectionCode}</strong>, impartida por{" "}
        {section.instructor.name}.
      </p>
      <hr />

      <div style={styles.layout}>
        {/* Columna de Contenido Principal */}
        <div style={{ flex: 2 }}>
          <h2>Contenido del Curso</h2>
          {isLoadingModules ? (
            <p>Cargando módulos...</p>
          ) : (
            modules.map((module) => (
              <ModuleItem key={module._id} module={module} />
            ))
          )}
        </div>

        {/* Columna de Tareas */}
        <div
          style={{ flex: 1, borderLeft: "1px solid #ccc", paddingLeft: "20px" }}
        >
          <h2>Tareas</h2>
          {isLoadingAssignments ? (
            <p>Cargando tareas...</p>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} style={styles.assignmentItem}>
                <p>
                  <strong>{assignment.title}</strong>
                </p>
                <button onClick={() => setSelectedAssignment(assignment)}>
                  Ver Tarea
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* El modal se renderiza aquí cuando hay una tarea seleccionada */}
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
