import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Skeleton para la Imagen */}
      <Skeleton className="h-40 w-full" />
      
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          {/* Skeleton para el Badge */}
          <Skeleton className="h-5 w-20 rounded-md" />
          {/* Skeleton para el código de sección */}
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        {/* Skeleton para el Título */}
        <Skeleton className="h-6 w-full rounded-md" />
        {/* Skeleton para la Descripción (Profesor) */}
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </CardHeader>

      <CardContent className="flex-1">
        {/* Skeleton para la barra de progreso */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>

      <CardFooter>
        {/* Skeleton para el Botón */}
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}

// Componente para mostrar una cuadrícula de Skeletons
export function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
    </div>
  );
}