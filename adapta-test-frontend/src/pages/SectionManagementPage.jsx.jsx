import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

// --- Redux Actions ---
import { getSectionDetails, reset as resetLearning } from '../features/learning/learningSlice';
import { getModulesForCourse, reset as resetContent } from '../features/content/contentSlice';

import AssignmentsTab from '../features/assignments/components/AssignmentsTab'
import AddModuleForm from '../features/content/AddModuleForm';
import ModuleItem from '../features/content/ModuleItem';


// --- Componentes de Pestañas (los definiremos aquí por claridad) ---

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



// --- COMPONENTE PRINCIPAL CORREGIDO Y AUTOSUFICIENTE ---
const SectionManagementPage = () => {
    const { id: sectionId } = useParams();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('modules');

    // Leemos la sección activa desde el nuevo 'learningSlice'
    const { section, isLoading: isLoadingSection } = useSelector((state) => state.learning);

    // Este useEffect ahora solo se encarga de cargar los datos de la sección
    useEffect(() => {
        dispatch(getSectionDetails(sectionId));
        
        // La limpieza se ejecuta cuando sales de la página
        return () => {
            dispatch(resetLearning());
        };
    }, [dispatch, sectionId]);

    if (isLoadingSection || !section) {
        return <h1>Cargando datos de la sección...</h1>;
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
                {/* Pasamos los IDs necesarios a cada pestaña */}
                {activeTab === 'modules' && <ModulesTab courseId={section.course._id} />}
                {activeTab === 'assignments' && <AssignmentsTab sectionId={section._id} />}
            </div>
        </div>
    );
};

export default SectionManagementPage;