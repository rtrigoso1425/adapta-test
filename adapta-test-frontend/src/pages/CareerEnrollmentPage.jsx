import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCareers } from "../features/careers/careerSlice";
import { enrollInCareer } from "../features/progress/progressSlice";
import { Link } from "react-router-dom";

const CareerEnrollmentPage = () => {
  const dispatch = useDispatch();
  const { careers, isLoading } = useSelector((state) => state.careers);

  useEffect(() => {
    dispatch(getCareers());
  }, [dispatch]);

  const handleEnroll = (careerId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres inscribirte en esta carrera? Esta acción no se puede deshacer."
      )
    ) {
      dispatch(enrollInCareer(careerId));
    }
  };

  if (isLoading) return <h2>Cargando carreras disponibles...</h2>;

  return (
    <div>
      <h1>Inscripción de Carrera</h1>
      <p>Elige una carrera para comenzar tu viaje académico.</p>
      {careers.map((career) => (
        <div
          key={career._id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            margin: "10px 0",
          }}
        >
          <h3>{career.name}</h3>
          <p>{career.description}</p>
          <Link to={`/career/${career._id}/curriculum`}>
            <button>Ver Malla Curricular</button>
          </Link>
          <button
            onClick={() => handleEnroll(career._id)}
            style={{
              marginLeft: "10px",
              background: "darkblue",
              color: "white",
            }}
          >
            Inscribirme
          </button>
        </div>
      ))}
    </div>
  );
};

export default CareerEnrollmentPage;
