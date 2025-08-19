import { useParams } from 'react-router-dom';

const CourseManagementPage = () => {
    const { id: courseId } = useParams(); // useParams nos da los parámetros de la URL, como el :id

    return (
        <div>
            <h1>Gestionando el Curso</h1>
            <p>ID del Curso: {courseId}</p>
            {/* Aquí construiremos la interfaz para añadir módulos y lecciones */}
        </div>
    );
};

export default CourseManagementPage;