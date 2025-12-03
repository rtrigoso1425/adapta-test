import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Datos de ejemplo
const pendingAssignments = [
  { id: 1, title: "Ensayo de Álgebra", course: "MAT-101", dueDate: "Mañana" },
  { id: 2, title: "Prototipo de App", course: "CS-101", dueDate: "en 3 días" },
  { id: 3, title: "Examen Parcial", course: "MAT-101", dueDate: "en 5 días" },
];

export function PendingAssignments() {
  // En el futuro, aquí usaremos un hook para fetchear las tareas reales
  // const { data: assignments, isLoading } = useGetPendingAssignments();

  const isLoading = false; // Simulación

  return (
    <Card className="sticky top-24"> {/* 'sticky top-24' para que flote al hacer scroll */}
      <CardHeader>
        <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
        <CardDescription>Tus próximas entregas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Skeleton para las tareas
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : pendingAssignments.length > 0 ? (
          // Lista de tareas
          <ul className="space-y-3">
            {pendingAssignments.map((task) => (
              <li key={task.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-secondary p-2 rounded-full">
                  <Clock className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.course} - Vence {task.dueDate}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/assignments/${task.id}`}>Ir</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          // Estado vacío
          <p className="text-sm text-muted-foreground text-center py-4">
            ¡Felicidades! No tienes tareas pendientes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}