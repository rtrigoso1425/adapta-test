import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSectionsForCourse } from '../../sections/sectionSlice';
import { getAssignmentsForSection, reset } from '../assignmentSlice';
import AddAssignmentForm from '../AddAssignmentForm';

const AssignmentsTab = ({ courseId }) => {
    const dispatch = useDispatch();
    const [selectedSection, setSelectedSection] = useState('');

    const { sections } = useSelector((state) => state.sections);
    const { assignments, isLoading } = useSelector((state) => state.assignments);

    useEffect(() => {
        // Pedimos las secciones de este curso para que el profesor elija dónde crear la tarea
        dispatch(getSectionsForCourse(courseId));
    }, [dispatch, courseId]);

    useEffect(() => {
        if (selectedSection) {
            dispatch(getAssignmentsForSection(selectedSection));
        }
        // Limpiar las tareas al cambiar de sección
        return () => { dispatch(reset()); };
    }, [dispatch, selectedSection]);

    return (
        <div>
            <h2>Gestión de Tareas</h2>
            <p>Selecciona una sección para ver o añadir tareas.</p>

            {/* --- Selector de Sección --- */}
            <select onChange={(e) => setSelectedSection(e.target.value)} value={selectedSection}>
                <option value="">-- Elige una sección --</option>
                {sections.map((section) => (
                    <option key={section._id} value={section._id}>
                        {section.sectionCode} (Instructor: {section.instructor.name})
                    </option>
                ))}
            </select>

            <hr style={{ margin: '20px 0' }}/>

            {/* --- Contenido Condicional --- */}
            {selectedSection ? (
                isLoading ? <p>Cargando tareas...</p> : (
                    <div>
                        <h3>Tareas para la Sección {sections.find(s => s._id === selectedSection)?.sectionCode}</h3>
                        {assignments.length > 0 ? (
                            assignments.map((assignment) => (
                                <div key={assignment._id} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
                                    <h4>{assignment.title}</h4>
                                </div>
                            ))
                        ) : <p>No hay tareas creadas para esta sección.</p>}
                        <AddAssignmentForm sectionId={selectedSection} />
                    </div>
                )
            ) : <p>Por favor, selecciona una sección para continuar.</p>}
        </div>
    );
};

export default AssignmentsTab;