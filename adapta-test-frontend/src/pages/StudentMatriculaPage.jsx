import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSectionsForCourse } from "../features/sections/sectionSlice";
import { enrollStudent } from "../features/enrollments/enrollmentSlice";

// --- Sub-componente para mostrar las secciones de un curso ---
const CourseSections = ({ courseId }) => {
  const dispatch = useDispatch();
  const { sections, isLoading } = useSelector((state) => state.sections);

  useEffect(() => {
    if (courseId) {
      dispatch(getSectionsForCourse(courseId));
    }
  }, [dispatch, courseId]);

  const handleEnroll = (sectionId) => {
    if (window.confirm("¿Confirmas tu matrícula en esta sección?")) {
      dispatch(enrollStudent(sectionId));
    }
  };

  if (isLoading) return <p>Buscando secciones disponibles...</p>;

  return (
    <div style={{ padding: "10px 20px", background: "#f9f9f9" }}>
      {sections.length > 0 ? (
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
              <strong>Sección {section.sectionCode}</strong> -{" "}
              {section.instructor.name}
            </div>
            <button onClick={() => handleEnroll(section._id)}>
              Matricularme
            </button>
          </div>
        ))
      ) : (
        <p>No hay secciones disponibles para este curso en el ciclo actual.</p>
      )}
    </div>
  );
};

// --- Componente Principal de la Página de Matrícula ---
const StudentMatriculaPage = () => {
  const { progressData } = useSelector((state) => state.progress);
  const [expandedCourseId, setExpandedCourseId] = useState(null); // Para saber qué curso está expandido

  if (!progressData || !progressData.eligibleCourses) {
    return <h2>Cargando cursos disponibles...</h2>;
  }

  const toggleSections = (courseId) => {
    setExpandedCourseId((prevId) => (prevId === courseId ? null : courseId));
  };

  return (
    <div>
      <h1>Matrícula Académica</h1>
      <p>
        Estás en el <strong>Ciclo {progressData.currentCycle}</strong>. Puedes
        matricularte en los siguientes cursos:
      </p>

      {progressData.eligibleCourses.length > 0 ? (
        progressData.eligibleCourses.map((course) => (
          <div
            key={course._id}
            style={{
              border: "1px solid #ddd",
              margin: "10px 0",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                padding: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4>{course.title}</h4>
                <p>{course.description}</p>
              </div>
              <button onClick={() => toggleSections(course._id)}>
                {expandedCourseId === course._id
                  ? "Ocultar Secciones"
                  : "Ver Secciones"}
              </button>
            </div>
            {/* Muestra las secciones solo si este curso está expandido */}
            {expandedCourseId === course._id && (
              <CourseSections courseId={course._id} />
            )}
          </div>
        ))
      ) : (
        <p>
          ¡Felicidades! Parece que ya has aprobado todos los cursos disponibles
          hasta este ciclo.
        </p>
      )}
    </div>
  );
};

export default StudentMatriculaPage;
