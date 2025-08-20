import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// YA NO necesitamos getSectionsForCourse aquí
import { getAssignmentsForSection, reset } from '../assignmentSlice';
import AddAssignmentForm from '../AddAssignmentForm';

// eslint-disable-next-line no-unused-vars
const AssignmentsTab = ({ sectionId }) => {
    const dispatch = useDispatch();

    const { assignments, isLoading } = useSelector((state) => state.assignments);

    useEffect(() => {
        // Pide las tareas para la sección específica que se le pasó
        if (sectionId) {
            dispatch(getAssignmentsForSection(sectionId));
        }
        return () => { dispatch(reset()); };
    }, [dispatch, sectionId]);

    return (
        <div>
            <h2>Gestión de Tareas</h2>
            {isLoading ? <p>Cargando tareas...</p> : (
                <div>
                    <h3>Tareas de esta Sección</h3>
                    {assignments.length > 0 ? (
                        assignments.map((assignment) => (
                            <div key={assignment._id} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
                                <h4>{assignment.title}</h4>
                            </div>
                        ))
                    ) : <p>No hay tareas creadas para esta sección.</p>}

                    {/* El formulario ahora siempre sabe a qué sección añadir la tarea */}
                    <AddAssignmentForm sectionId={sectionId} />
                </div>
            )}
        </div>
    );
};

export default AssignmentsTab;