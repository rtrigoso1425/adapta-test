import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

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
    // Añadimos el título del curso al objeto de la sección para mostrarlo fácilmente en el resumen
    dispatch(
      addSection({ ...section, courseTitle: course.title, course: course._id })
    );
  };

  // Verificamos si ya hay una sección de este curso en el "carrito"
  const isCourseInCart = !!selectedSections[course._id];

  if (isLoading)
    return <p style={{ padding: "20px" }}>Buscando secciones disponibles...</p>;

  return (
    <div style={{ padding: "10px 20px", background: "#f9f9f9" }}>
      {sections && sections.length > 0 ? (
        sections.map((section) => (
          <div
            key={section._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div>
              <strong>Sección {section.sectionCode}</strong>
              <span style={{ marginLeft: "15px", color: "#555" }}>
                Profesor: {section.instructor.name}
              </span>
            </div>
            <button
              onClick={() => handleSelectSection(section)}
              disabled={isCourseInCart}
            >
              {isCourseInCart ? "Seleccionado" : "Añadir a Matrícula"}
            </button>
          </div>
        ))
      ) : (
        <p style={{ padding: "10px 0" }}>
          No hay secciones abiertas para este curso en el ciclo académico
          actual.
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
    <div
      style={{
        border: "2px solid #007bff",
        padding: "20px",
        borderRadius: "8px",
        background: "#f8f9fa",
      }}
    >
      <h3>Resumen de tu Matrícula</h3>
      {sectionsArray.length > 0 ? (
        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {sectionsArray.map((section) => (
            <li
              key={section._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {section.courseTitle} - (Sección {section.sectionCode})
              </span>
              <button
                onClick={() => dispatch(removeSection(section.course))}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no has seleccionado ningún curso.</p>
      )}

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {isLoading ? "Procesando Matrícula..." : "Confirmar Matrícula"}
      </button>
      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: Página de Matrícula
// ===================================================================================
const StudentMatriculaPage = () => {
  const { progressData } = useSelector((state) => state.progress);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const toggleSections = (courseId) => {
    setExpandedCourseId((prevId) => (prevId === courseId ? null : courseId));
  };

  if (!progressData || !progressData.eligibleCourses) {
    return <h2>Cargando cursos disponibles para tu matrícula...</h2>;
  }

  return (
    <div>
      <h1>Matrícula Académica</h1>
      <p>
        Estás ubicado en el <strong>Ciclo {progressData.currentCycle}</strong>.
        A continuación, selecciona las secciones en las que deseas matricularte.
      </p>

      <MatriculaSummary />

      <h3
        style={{
          marginTop: "40px",
          borderBottom: "2px solid #ccc",
          paddingBottom: "10px",
        }}
      >
        Cursos Disponibles
      </h3>
      {progressData.eligibleCourses.length > 0 ? (
        progressData.eligibleCourses.map((course) => (
          <div
            key={course._id}
            style={{
              border: "1px solid #ddd",
              margin: "15px 0",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <div>
                <h4 style={{ margin: 0 }}>{course.title}</h4>
                <p style={{ margin: "5px 0 0", color: "#666" }}>
                  {course.description}
                </p>
              </div>
              <button onClick={() => toggleSections(course._id)}>
                {expandedCourseId === course._id
                  ? "Ocultar Secciones"
                  : "Ver Secciones"}
              </button>
            </div>
            {expandedCourseId === course._id && (
              <CourseSectionsViewer course={course} />
            )}
          </div>
        ))
      ) : (
        <div
          style={{
            padding: "20px",
            background: "#e8f5e9",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <p>
            <strong>¡Felicitaciones!</strong> Parece que ya has aprobado todos
            los cursos disponibles en tu malla hasta este ciclo.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentMatriculaPage;
