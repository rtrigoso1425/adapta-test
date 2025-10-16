import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyCareer, addCourseToCurriculum, reset as resetCareers } from '../careers/careerSlice';
import { getCourses, uploadSyllabus, reset as resetCourses } from '../courses/courseSlice';

// --- Sub-componente: Formulario para gestionar la Malla Curricular ---
const CurriculumForm = ({ careerId }) => {
    const dispatch = useDispatch();
    const { courses, isLoading: coursesLoading } = useSelector((state) => state.courses);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [cycleNumber, setCycleNumber] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        if (selectedCourse && cycleNumber) {
            const courseData = {
                courseId: selectedCourse,
                cycleNumber: parseInt(cycleNumber, 10) // Aseguramos que sea un número
            };
            dispatch(addCourseToCurriculum({ careerId, courseData }));
            setSelectedCourse('');
            setCycleNumber('');
        }
    };

    if (coursesLoading) {
        return <p>Cargando lista de cursos...</p>;
    }

    return (
        <section style={{ border: '2px dashed #ccc', padding: '20px', marginTop: '30px', borderRadius: '5px' }}>
            <h3>Añadir Curso a la Malla</h3>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="course-select">Curso:</label><br/>
                    <select id="course-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                        <option value="">-- Selecciona un curso del catálogo --</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="cycle-number">Número de Ciclo:</label><br/>
                    <input
                        id="cycle-number"
                        type="number"
                        min="1"
                        value={cycleNumber}
                        onChange={(e) => setCycleNumber(e.target.value)}
                        placeholder="Ej. 1"
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit">Añadir a Malla</button>
            </form>
        </section>
    );
};

// ===================================================================================
//  NUEVO SUB-COMPONENTE: Para Subir el Sílabus
// ===================================================================================
const SyllabusUploader = ({ coursesInCurriculum }) => {
    const dispatch = useDispatch();
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCourseId || !selectedFile) {
            alert('Por favor, selecciona un curso y un archivo PDF.');
            return;
        }

        const formData = new FormData();
        formData.append('syllabus', selectedFile); // 'syllabus' debe coincidir con el nombre en upload.single()

        dispatch(uploadSyllabus({ courseId: selectedCourseId, formData }));
    };

    return (
        <div style={{ border: '2px dashed #ccc', padding: '20px', marginTop: '30px' }}>
            <h3>Subir o Actualizar Sílabus de un Curso</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Selecciona el Curso:</label><br/>
                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">-- Selecciona un curso de tu malla --</option>
                        {coursesInCurriculum.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Archivo PDF del Sílabus:</label><br/>
                    <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} required />
                </div>
                <button type="submit">Subir Sílabus</button>
            </form>
        </div>
    );
};



// --- Componente Principal: Dashboard del Coordinador ---
const CoordinatorDashboard = () => {
    const dispatch = useDispatch();
    const { myCareer, isLoading } = useSelector((state) => state.careers);
    
    useEffect(() => {
        dispatch(getMyCareer());
        dispatch(getCourses());

        return () => {
            dispatch(resetCareers());
            dispatch(resetCourses());
        }
    }, [dispatch]);

    if (isLoading || !myCareer) {
        return <h3>Cargando datos del coordinador...</h3>;
    }
    const allCoursesInCurriculum = myCareer.curriculum.flatMap(cycle => cycle.courses);
    return (
        <div>
            <h1>Gestión de Carrera: {myCareer.name}</h1>
            <p>{myCareer.description}</p>
            <hr />
            <h2>Malla Curricular</h2>
            {myCareer.curriculum && myCareer.curriculum.length > 0 ? (
                myCareer.curriculum.map(cycle => (
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
                <p>La malla curricular aún no ha sido definida.</p>
            )}

            <CurriculumForm careerId={myCareer._id} />
            <SyllabusUploader coursesInCurriculum={allCoursesInCurriculum} />
        </div>
    );
};

export default CoordinatorDashboard;