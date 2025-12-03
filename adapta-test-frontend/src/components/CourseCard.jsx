import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; //
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; //
import { MoveRight } from "lucide-react";

export function CourseCard({ enrollment }) {
  // Simulamos un progreso como en el componente original
  const progress = Math.floor(Math.random() * 30 + 5); 

  return (
    <Link to={`/learn/section/${enrollment.section._id}`} className="group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
        {/* Imagen de Cabecera */}
        <div className="h-40 w-full overflow-hidden">
          <div 
            className="h-full w-full bg-gradient-to-r from-primary/10 to-blue-500/20 group-hover:scale-105 transition-transform duration-500"
            // Aquí se podría poner una imagen real:
            // style={{ backgroundImage: `url(${enrollment.course.imageUrl})`, backgroundSize: 'cover' }}
          />
        </div>

        {/* Contenido de la Tarjeta */}
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="font-medium">
              En progreso
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {enrollment.section.sectionCode}
            </span>
          </div>
          <CardTitle className="line-clamp-2">
            {enrollment.section.course.title}
          </CardTitle>
          <CardDescription className="line-clamp-1">
            Prof. {enrollment.section.instructor.name}
          </CardDescription>
        </CardHeader>

        {/* Progreso (en el medio) */}
        <CardContent className="flex-1">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{progress}% completado</p>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>

        {/* Footer (Botón) */}
        <CardFooter>
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            Ir al Curso
            <MoveRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}