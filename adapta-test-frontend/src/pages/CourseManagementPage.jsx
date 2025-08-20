import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getModulesForCourse,
  getCourseDetails,
  reset,
} from "../features/content/contentSlice";
import AddModuleForm from "../features/content/AddModuleForm";
import ModuleItem from "../features/content/ModuleItem";
import AssignmentsTab from "../features/assignments/components/AssignmentsTab";

// Componente para la Pestaña de Módulos
const ModulesTab = ({ courseId }) => {
    const dispatch = useDispatch();
    const { modules, isLoading } = useSelector((state) => state.content);

    useEffect(() => {
        dispatch(getModulesForCourse(courseId));
        return () => { dispatch(reset()); };
    }, [dispatch, courseId]);

    if (isLoading && modules.length === 0) {
        return <h1>Cargando contenido del curso...</h1>;
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



const CourseManagementPage = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const { id: courseId } = useParams();
  const dispatch = useDispatch();
  const { course, isLoading } = useSelector((state) => state.content);

  useEffect(() => {
    dispatch(getCourseDetails(courseId));
    //dispatch(getModulesForCourse(courseId));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, courseId]);

  if (isLoading || !course) {
    return <h1>Cargando datos del curso...</h1>;
  }

  return (
    <div>
      <h1>Gestionando: {course.title}</h1>
      <p>{course.description}</p>
      <hr />

      {/* Navegación de pestañas */}
      <nav>
        <button onClick={() => setActiveTab('modules')}>Módulos</button>
        <button onClick={() => setActiveTab('assignments')}>Tareas</button>
      </nav>

      {/* Contenido de la pestaña activa */}
      <div style={{ marginTop: '20px' }}>
        {activeTab === 'modules' && <ModulesTab courseId={courseId} />}
        {activeTab === 'assignments' && <AssignmentsTab courseId={courseId} />}
      </div>
    </div>
  );
};

export default CourseManagementPage;
