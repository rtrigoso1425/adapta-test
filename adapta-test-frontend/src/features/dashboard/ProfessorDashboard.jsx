// src/features/dashboard/ProfessorDashboard.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
// La acción `getMySections` y el slice ya están preparados para funcionar
import { getMySections, reset } from "../sections/sectionSlice";

const ProfessorDashboard = () => {
  const dispatch = useDispatch();

  // Obtenemos 'mySections' del slice de secciones
  const { mySections, isLoading } = useSelector((state) => state.sections);

  useEffect(() => {
    // Pedimos las secciones asignadas al profesor. El backend se encarga del filtrado.
    dispatch(getMySections());

    // Limpiamos el estado al salir del componente
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (isLoading) {
    return <h3>Cargando tus secciones asignadas...</h3>;
  }

  return (
    <div>
      <h1>Dashboard del Profesor</h1>
      <p>
        Estas son las secciones que tienes asignadas para el ciclo académico
        actual en tu institución.
      </p>
      <section>
        <h2>Mis Secciones</h2>
        {mySections && mySections.length > 0 ? (
          mySections.map((section) => (
            <div
              key={section._id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                margin: "10px 0",
              }}
            >
              <h3>{section.course.title}</h3>
              <h4>Sección: {section.sectionCode}</h4>
              <p>Ciclo: {section.academicCycle.name}</p>
              <Link to={`/manage/section/${section._id}`}>
                <button>Gestionar Sección</button>
              </Link>
            </div>
          ))
        ) : (
          <p>No tienes secciones asignadas para este ciclo.</p>
        )}
      </section>
    </div>
  );
};

export default ProfessorDashboard;
