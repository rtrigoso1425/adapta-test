import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSectionsForCourse, reset } from '../features/sections/sectionSlice';
import { useValidateId } from '../hooks/useValidateId';

const CourseDetailPage = () => {
    const dispatch = useDispatch();
    const { id: courseId } = useParams();
    const isValidId = useValidateId(courseId); // ← Validar ID
    const { sections, isLoading } = useSelector((state) => state.sections);

    useEffect(() => {
        if (isValidId) {
            dispatch(getSectionsForCourse(courseId));
        }
        return () => { dispatch(reset()); };
    }, [dispatch, courseId, isValidId]);

    if (isLoading) return <h3>Cargando secciones...</h3>;

    return (
        <div>
            {/* Aquí podríamos mostrar el título del curso, que obtendríamos del estado de 'courses' */}
            <h1>Secciones Disponibles</h1>
            {sections.length > 0 ? (
                sections.map((section) => (
                    <div key={section._id} style={{ border: '1px solid #eee', padding: '15px', margin: '10px 0' }}>
                        <h4>Sección: {section.sectionCode}</h4>
                        <p>Instructor: {section.instructor.name}</p>
                        <p>Capacidad: {section.capacity} alumnos</p>
                    </div>
                ))
            ) : (
                <p>No hay secciones disponibles para este curso en el ciclo actual.</p>
            )}
        </div>
    );
};

export default CourseDetailPage;