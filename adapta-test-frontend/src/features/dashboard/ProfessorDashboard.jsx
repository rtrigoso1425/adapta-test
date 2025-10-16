import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getMySections } from "../sections/sectionSlice"; // <-- CAMBIO

const ProfessorDashboard = () => {
  const dispatch = useDispatch();
  // CAMBIO: Ahora obtenemos 'mySections' del 'sectionSlice'
  const { mySections, isLoading } = useSelector((state) => state.sections);

  useEffect(() => {
    // CAMBIO: Despachamos la nueva acción
    dispatch(getMySections());
  }, [dispatch]);

  if (isLoading) return <h3>Cargando tus secciones asignadas...</h3>;

  return (
    <div>
      <h1>Dashboard del Profesor</h1>
      <p>Estas son las secciones que tienes asignadas para este ciclo.</p>
      <section>
        <h2>Mis Secciones</h2>
        {mySections.length > 0 ? (
          mySections.map((section) => (
            <div
              key={section._id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                margin: "10px 0",
              }}
            >
              {/* AHORA MOSTRAMOS LA INFORMACIÓN DETALLADA */}
              <h3>{section.course.title}</h3>
              <h4>Sección: {section.sectionCode}</h4>
              <p>Ciclo: {section.academicCycle.name}</p>
              <p>Capacidad: {section.capacity} alumnos</p>
              <Link to={`/manage/section/${section._id}`}>
                Gestionar Sección
              </Link>
            </div>
          ))
        ) : (
          <p>No tienes secciones asignadas todavía.</p>
        )}
      </section>
    </div>
  );
};

export default ProfessorDashboard;
