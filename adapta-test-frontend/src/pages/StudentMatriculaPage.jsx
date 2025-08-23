import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSectionsForCourse, reset as resetSections } from "../features/sections/sectionSlice";
import { enrollStudent } from "../features/enrollments/enrollmentSlice";

// --- Sub-componente para mostrar las secciones de un curso ---
const CourseSectionsViewer = ({ courseId }) => {
    const dispatch = useDispatch();
    const { sections, isLoading } = useSelector((state) => state.sections);

    useEffect(() => {
        // Cuando este componente se monta, busca las secciones del curso
        if (courseId) {
            dispatch(getSectionsForCourse(courseId));
        }
        // Cuando se desmonta (ej. al ocultar), limpia el estado de secciones
        return () => {
            dispatch(resetSections());
        }
    }, [dispatch, courseId]);

    const handleEnroll = (sectionId) => {
        if (window.confirm('¿Confirmas tu matrícula en esta sección? El sistema verificará los prerrequisitos y la capacidad.')) {
            dispatch(enrollStudent(sectionId));
        }
    };

    if (isLoading) return <p style={{ padding: '20px' }}>Buscando secciones disponibles...</p>;

    return (
        <div style={{ padding: '10px 20px', background: '#f9f9f9' }}>
            {sections && sections.length > 0 ? (
                sections.map(section => (
                    <div key={section._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        <div>
                            <strong>Sección {section.sectionCode}</strong>
                            <span style={{ marginLeft: '15px', color: '#555' }}>Profesor: {section.instructor.name}</span>
                        </div>
                        <button onClick={() => handleEnroll(section._id)} style={{ background: 'green', color: 'white' }}>Matricularme</button>
                    </div>
                ))
            ) : <p style={{ padding: '10px 0' }}>No hay secciones abiertas para este curso en el ciclo académico actual.</p>}
        </div>
    );
};


// --- Componente Principal de la Página de Matrícula ---
const StudentMatriculaPage = () => {
    const { progressData } = useSelector((state) => state.progress);
    const [expandedCourseId, setExpandedCourseId] = useState(null);

    const toggleSections = (courseId) => {
        setExpandedCourseId(prevId => (prevId === courseId ? null : courseId));
    };

    if (!progressData || !progressData.eligibleCourses) {
        return <h2>Cargando cursos disponibles para tu matrícula...</h2>;
    }

    return (
        <div>
            <h1>Matrícula Académica</h1>
            <p>Estás ubicado en el <strong>Ciclo {progressData.currentCycle}</strong>. Basado en tu avance, puedes matricularte en los siguientes cursos:</p>
            
            {progressData.eligibleCourses.length > 0 ? (
                progressData.eligibleCourses.map(course => (
                    <div key={course._id} style={{ border: '1px solid #ddd', margin: '15px 0', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>{course.title}</h4>
                                <p style={{ margin: '5px 0 0', color: '#666' }}>{course.description}</p>
                            </div>
                            <button onClick={() => toggleSections(course._id)}>
                                {expandedCourseId === course._id ? 'Ocultar Secciones' : 'Ver Secciones'}
                            </button>
                        </div>
                        {/* Muestra las secciones solo si este curso está expandido */}
                        {expandedCourseId === course._id && <CourseSectionsViewer courseId={course._id} />}
                    </div>
                ))
            ) : (
                <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '8px', marginTop: '20px' }}>
                    <p><strong>¡Felicitaciones!</strong> Parece que ya has aprobado todos los cursos disponibles en tu malla hasta este ciclo. Prepárate para el siguiente.</p>
                </div>
            )}
        </div>
    );
};

export default StudentMatriculaPage;