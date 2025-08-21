import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

// Actions de Redux
import { getSectionDetails, reset as resetLearning } from '../features/learning/learningSlice';
import { getModulesForSection, reset as resetContent } from '../features/content/contentSlice';
import { getAssignmentsForSection, reset as resetAssignments } from '../features/assignments/assignmentSlice';

// Componentes
import ModuleItem from '../features/content/ModuleItem'; // Reutilizaremos este componente

const LearningPage = () => {
    const { id: sectionId } = useParams();
    const dispatch = useDispatch();

    // eslint-disable-next-line no-unused-vars
    const { user } = useSelector((state) => state.auth);
    const { section, isLoading: isLoadingSection } = useSelector((state) => state.learning);
    const { modules, isLoading: isLoadingModules } = useSelector((state) => state.content);
    const { assignments, isLoading: isLoadingAssignments } = useSelector((state) => state.assignments);

    useEffect(() => {
        // Cargar todos los datos necesarios para esta vista
        dispatch(getSectionDetails(sectionId));
        dispatch(getModulesForSection(sectionId));
        dispatch(getAssignmentsForSection(sectionId));

        // Limpiar los estados al salir de la página
        return () => {
            dispatch(resetLearning());
            dispatch(resetContent());
            dispatch(resetAssignments());
        };
    }, [dispatch, sectionId]);

    if (isLoadingSection || !section) {
        return <h1>Cargando curso...</h1>;
    }

    return (
        <div>
            <h1>{section.course.title}</h1>
            <p>Bienvenido a la sección <strong>{section.sectionCode}</strong>, impartida por {section.instructor.name}.</p>
            <hr />

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Columna de Contenido Principal */}
                <div style={{ flex: 2 }}>
                    <h2>Contenido del Curso</h2>
                    {isLoadingModules ? <p>Cargando módulos...</p> : (
                        modules.length > 0 ? (
                            modules.map((module) => (
                                <ModuleItem key={module._id} module={module} />
                            ))
                        ) : <p>El contenido de este curso aún no ha sido publicado.</p>
                    )}
                </div>

                {/* Columna de Tareas y Anuncios */}
                <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
                    <h2>Tareas Pendientes</h2>
                    {isLoadingAssignments ? <p>Cargando tareas...</p> : (
                        assignments.length > 0 ? (
                            <ul>
                                {assignments.map(assignment => (
                                    <li key={assignment._id}>{assignment.title}</li>
                                ))}
                            </ul>
                        ) : <p>No hay tareas asignadas.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningPage;