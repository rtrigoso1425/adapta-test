import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check } from "lucide-react";

// Función para formatear fechas (simplificada)
const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha límite";
  return new Date(dateString).toLocaleDateString("es-ES", {
    month: "long",
    day: "numeric",
  });
};

export function AssignmentCard({ assignment, mySubmission, onOpen }) {
  const isSubmitted = !!mySubmission;
  const isGraded = mySubmission && mySubmission.grade != null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {isGraded ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <Check className="h-3 w-3 mr-1" />
              Calificado
            </Badge>
          ) : isSubmitted ? (
            <Badge variant="secondary">Entregado</Badge>
          ) : (
            <Badge variant="outline">Pendiente</Badge>
          )}

          {isGraded && (
             <span className="text-xl font-bold">{mySubmission.grade} / {assignment.pointsPossible || 100}</span>
          )}
        </div>
        <CardTitle className="text-lg">{assignment.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {formatDate(assignment.dueDate)}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button 
          variant={isSubmitted ? "outline" : "default"} 
          className="w-full"
          onClick={onOpen}
        >
          {isSubmitted ? "Ver Entrega" : "Realizar Entrega"}
        </Button>
      </CardFooter>
    </Card>
  );
}