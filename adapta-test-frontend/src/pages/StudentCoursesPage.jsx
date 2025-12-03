import { useEffect, useState } from "react";
import axios from "axios";
import { store } from "../services/store";
import { CourseCard } from "@/components/CourseCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- 1. Importar Select
import { CourseGridSkeleton } from "@/components/CourseCardSkeleton"; // <-- 2. Importar Skeletons
import { PendingAssignments } from "@/components/PendingAssignments"; // <-- 3. Importar Tareas

const StudentCoursesPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = store.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/enrollments/my-history", config);
        setHistory(data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((group) => {
    if (filter === "all") return true;
    if (filter === "active") return group.isActive;
    return group.cycleId === filter;
  });

  // --- 4. Renderizado con Tailwind y componentes UI ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Columna Principal de Cursos (ocupa 3 de 4 columnas en 'lg') */}
      <div className="lg:col-span-3 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          
          {/* 5. Filtro REEMPLAZADO con Shadcn Select */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar periodo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Periodo actual</SelectItem>
              <SelectItem value="all">Todos los periodos</SelectItem>
              {history.map((group) => (
                <SelectItem key={group.cycleId} value={group.cycleId}>
                  {group.cycleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* 6. Lógica de Carga con SKELETON */}
        {loading ? (
          <CourseGridSkeleton />
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((group) => (
            <section key={group.cycleId}>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                {group.cycleName}
                {group.isActive && (
                  <Badge variant="secondary" className="ml-3">
                    Actual
                  </Badge>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.enrollments.map((enrollment) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="text-muted-foreground">No tienes cursos para mostrar en este periodo.</p>
        )}
      </div>

      {/* 7. Columna Lateral de Tareas (ocupa 1 de 4 columnas en 'lg') */}
      <aside className="lg:col-span-1 space-y-4">
        <PendingAssignments />
      </aside>
    </div>
  );
};

export default StudentCoursesPage;