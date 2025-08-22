import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// Necesitaremos una nueva acción para obtener una sola carrera, la crearemos a continuación
import { getCareerById, reset } from '../features/careers/careerSlice'; 

const CurriculumViewPage = () => {
    const { id: careerId } = useParams();
    const dispatch = useDispatch();
    
    // Usaremos 'myCareer' del slice para almacenar la carrera que estamos viendo
    const { myCareer: career, isLoading } = useSelector((state) => state.careers);

    useEffect(() => {
        dispatch(getCareerById(careerId));

        return () => {
            dispatch(reset());
        };
    }, [dispatch, careerId]);

    if (isLoading || !career) {
        return <h3>Cargando malla curricular...</h3>;
    }

    return (
        <div>
            <Link to="/dashboard">← Volver al Dashboard</Link>
            <h1 style={{ marginTop: '20px' }}>Malla Curricular: {career.name}</h1>
            <p><strong>Coordinador:</strong> {career.coordinator?.name || 'No asignado'}</p>
            <p><strong>Duración:</strong> {career.duration}</p>
            <hr />
            
            {career.curriculum && career.curriculum.length > 0 ? (
                career.curriculum.map(cycle => (
                    <div key={cycle.cycleNumber} style={{ border: '1px solid #eee', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
                        <h4>Ciclo {cycle.cycleNumber}</h4>
                        {cycle.courses && cycle.courses.length > 0 ? (
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                {cycle.courses.map(course => (
                                    <li key={course._id}>{course.title}</li>
                                ))}
                            </ul>
                        ) : <p>No hay cursos asignados a este ciclo.</p>}
                    </div>
                ))
            ) : (
                <p>La malla curricular aún no ha sido definida para esta carrera.</p>
            )}
        </div>
    );
};

export default CurriculumViewPage;