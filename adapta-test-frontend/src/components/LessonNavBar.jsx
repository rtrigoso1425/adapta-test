import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, List } from "lucide-react";

export function LessonNavBar({
  lessonList,
  currentLesson,
  isCompleted,
  onBackToList,
  onNavigate,
  onMarkComplete
}) {
  const currentIndex = lessonList.findIndex(l => l._id === currentLesson._id);
  const prevLesson = lessonList[currentIndex - 1];
  const nextLesson = lessonList[currentIndex + 1];

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full bg-card/90 border-t backdrop-blur-sm z-10">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* Botón de Volver a la Lista */}
        <Button variant="outline" onClick={onBackToList}>
          <List className="h-4 w-4 mr-2" />
          Contenido
        </Button>

        <div className="flex items-center gap-2">
          {/* Botón Anterior */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onNavigate(prevLesson)}
            disabled={!prevLesson}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Botón Marcar como Completada */}
          <Button 
            variant={isCompleted ? "secondary" : "default"}
            onClick={onMarkComplete}
            disabled={isCompleted}
            className="w-40"
          >
            {isCompleted ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Completada
              </>
            ) : (
              "Marcar como Completada"
            )}
          </Button>

          {/* Botón Siguiente */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onNavigate(nextLesson)}
            disabled={!nextLesson}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}