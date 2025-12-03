import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LessonItem({ lesson, isCompleted, onClick }) { // <-- onClick
  const LessonIcon = lesson.contentType === "video_url" ? PlayCircle : Circle;

  return (
    // CAMBIO: Ahora es un div clicable con role="button"
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <LessonIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <span className={cn(
          "text-sm font-medium", 
          isCompleted && "text-muted-foreground line-through"
        )}>
          {lesson.title}
        </span>
      </div>
      
      {/* CAMBIO: Botón de completar eliminado */}
    </div>
  );
}