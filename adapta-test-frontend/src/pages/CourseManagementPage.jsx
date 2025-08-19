import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
// CAMBIO 1: Importamos la nueva acción
import { getModulesForCourse, getCourseDetails, reset } from '../features/content/contentSlice';
import AddModuleForm from '../features/content/AddModuleForm';

const CourseManagementPage = () => {
    const { id: courseId } = useParams();
    const dispatch = useDispatch();
    // CAMBIO 2: Obtenemos también el 'course' del estado
    const { course, modules, isLoading } = useSelector((state) => state.content);

    useEffect(() => {
        // CAMBIO 3: Despachamos ambas acciones al cargar
        dispatch(getCourseDetails(courseId));
        dispatch(getModulesForCourse(courseId));

        return () => { dispatch(reset()); };
    }, [dispatch, courseId]);

    // Mejoramos la condición de carga
    if (isLoading || !course) {
        return <h1>Cargando datos del curso...</h1>;
    }

    return (
        <div>
            {/* CAMBIO 4: Mostramos el título y la descripción del curso */}
            <h1>Gestionando: {course.title}</h1>
            <p>{course.description}</p>
            <hr />

            <section>
                <h2>Módulos del Curso</h2>
                {modules.length > 0 ? (
                    modules.map((module) => (
                        <div key={module._id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0' }}>
                            <h3>{module.title}</h3>
                        </div>
                    ))
                ) : (
                    <p>Este curso aún no tiene módulos. ¡Añade el primero!</p>
                )}
            </section>

            <AddModuleForm courseId={courseId} />
        </div>
    );
};

export default CourseManagementPage;