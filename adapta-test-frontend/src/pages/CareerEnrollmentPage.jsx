import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCareers } from "../features/careers/careerSlice";
import { enrollInCareer } from "../features/progress/progressSlice";
import { Component as BauhausCard } from "../components/bauhaus-card";

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
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {careers.map((career) => (
          <div key={career._id} className="p-2">
            <BauhausCard
              id={career._id}
              topInscription={career.duration || ""}
              mainText={career.name || "Sin nombre"}
              subMainText={career.description || "Sin descripción"}
              filledButtonInscription="Inscribirme"
              outlinedButtonInscription="Ver Malla"
              onFilledButtonClick={() => handleEnroll(career._id)}
              onOutlinedButtonClick={() => { 
                window.location.href = `/career/${career._id}/curriculum`; 
              }}
              accentColor={`hsl(var(--primary))`}
              backgroundColor={`hsl(var(--card))`}
              textColorMain={`hsl(var(--card-foreground))`}
              textColorSub={`hsl(var(--muted-foreground))`}
              chronicleButtonBg={`transparent`}
              chronicleButtonFg={`hsl(var(--foreground))`}
              chronicleButtonHoverFg={`hsl(var(--primary-foreground))`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerEnrollmentPage;