// src/features/dashboard/ProfessorDashboard.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CardFlip from "../../components/flip-card";
import { BlurFade } from "../../components/ui/blur-fade";
import { Book } from "lucide-react";

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
    };
  }, [dispatch]);

  if (isLoading) {
    return <h3>Cargando tus secciones asignadas...</h3>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BlurFade inView delay={0.1}>
        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-card/50 p-2.5 rounded-lg">
                <Book className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Dashboard del Profesor</h1>
                <p className="text-xl text-foreground">Tus secciones asignadas en este ciclo</p>
                <p className="text-sm text-muted-foreground mt-1">Gestiona cada sección desde la tarjeta correspondiente.</p>
              </div>
            </div>
          </div>
        </div>
      </BlurFade>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Mis Secciones</h2>
        {mySections && mySections.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mySections.map((section) => (
              <div key={section._id} className="max-w-[360px]">
                <CardFlip
                  title={section.course?.title || "Sin título"}
                  subtitle={`Sección: ${section.sectionCode || section._id.substring(0,8)}`}
                  description={`Ciclo: ${section.academicCycle?.name || "-"}`}
                  features={[
                    `Nombre de sección: ${section.name || section.sectionCode || "-"}`,
                    `Capacidad: ${section.capacity ?? "-" } alumnos`,
                  ]}
                  color="#0ea5e9"
                  actionLabel="Gestionar Sección"
                  actionHref={`/manage/section/${section._id}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No tienes secciones asignadas para este ciclo.</p>
        )}
      </section>
    </div>
  );
};

export default ProfessorDashboard;
