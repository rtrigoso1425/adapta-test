import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

// Redux Actions que SÍ tenemos
import { getModulesForCourse, getCourseDetails, reset as resetContent } from '../features/content/contentSlice';
import { reset as resetSections, getSectionsForCourse } from '../features/sections/sectionSlice'; // Solo para resetear

// Componentes
import AssignmentsTab from '../features/assignments/components/AssignmentsTab'; // Asegúrate de que este componente exista
import ModuleItem from '../features/content/ModuleItem';
import AddModuleForm from '../features/content/AddModuleForm';


// --- Componente para la Pestaña de Módulos ---
const ModulesTab = ({ courseId }) => {
    const dispatch = useDispatch();
    const { modules, isLoading } = useSelector((state) => state.content);

    useEffect(() => {
        if (courseId) {
            dispatch(getModulesForCourse(courseId));
        }
        return () => { dispatch(resetContent()); };
    }, [dispatch, courseId]);

    if (isLoading) {
        return <p>Cargando módulos...</p>;
    }

    return (
        <div>
            <section>
                <h2>Módulos del Curso</h2>
                {modules.length > 0 ? (
                    modules.map((module) => <ModuleItem key={module._id} module={module} />)
                ) : ( <p>Este curso aún no tiene módulos.</p> )}
            </section>
            <AddModuleForm courseId={courseId} />
        </div>
    );
};


// --- COMPONENTE PRINCIPAL CORREGIDO (SIN LEARNING SLICE) ---
const SectionManagementPage = () => {
    const { id: sectionId } = useParams();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('modules');

    // Leemos la lista de secciones que el Dashboard ya cargó
    const { mySections, isLoading: isLoadingSections } = useSelector((state) => state.sections);

    // Buscamos la sección actual en la lista
    const section = mySections.find(s => s._id === sectionId);

    // Limpiamos el estado de las secciones cuando salimos de la página
    useEffect(() => {
        dispatch(getCourseDetails(sectionId));
    dispatch(getModulesForCourse(sectionId));
    dispatch(getSectionsForCourse(sectionId));
        return () => {
            dispatch(resetSections());
        };
    }, [dispatch]);

    if (isLoadingSections) {
        return <h1>Cargando...</h1>;
    }
    
    // Si no se encuentra la sección (por ejemplo, al recargar la página directamente)
    if (!section) {
        return <h1>Sección no encontrada. Por favor, vuelve al Dashboard.</h1>;
    }

    return (
        <div>
            <h1>Gestionando: {section.course.title}</h1>
            <h3>Sección: {section.sectionCode}</h3>
            <hr />

            <nav style={{ marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('modules')}>Módulos</button>
                <button onClick={() => setActiveTab('assignments')}>Tareas</button>
            </nav>

            <div>
                {/* Pasamos el courseId y sectionId necesarios a cada pestaña */}
                {activeTab === 'modules' && <ModulesTab courseId={section.course._id} />}
                {activeTab === 'assignments' && <AssignmentsTab sectionId={section._id} />}
            </div>
        </div>
    );
};

export default SectionManagementPage;