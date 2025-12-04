import React from 'react';
// import VideoPlayer from "@/components/ui/video-player"; // <-- Lo comentamos porque usaremos ReactPlayer
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Link, PlayCircle } from "lucide-react";
import ReactPlayer from 'react-player'; // Asegúrate de haber hecho: npm install react-player

export function LessonContentRenderer({ lesson }) {
  
  // Renderizador de contenido de texto
  const renderTextContent = () => {
    // Si usaras Markdown en el futuro, aquí iría el componente.
    // Por ahora, texto plano con saltos de línea:
    return <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{lesson.content}</p>;
  };

  // Renderizador para otros tipos de archivos (PDFs, Slides)
  const renderFileLink = (typeName) => (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 border-2 border-dashed border-muted-foreground/25 rounded-xl hover:bg-muted/50 transition-colors">
      <FileText className="h-12 w-12 text-primary mb-3" />
      <h3 className="text-lg font-semibold text-foreground">Material: {typeName}</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
        Haz clic abajo para abrir o descargar este recurso.
      </p>
      <a 
        href={lesson.fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <Link className="h-4 w-4" />
        Abrir Recurso
      </a>
    </div>
  );

  switch (lesson.contentType) {
    case "video_url":
      // --- CORRECCIÓN AQUÍ ---
      // Usamos ReactPlayer envuelto en un div responsivo
      return (
        <div className="w-full space-y-4">
           {/* Contenedor con aspect-ratio para que el video no se deforme */}
           <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-md">
             {/* pt-[56.25%] es el truco para mantener ratio 16:9 */}
             <ReactPlayer
               url={lesson.fileUrl}
               width="100%"
               height="100%"
               controls={true}
               className="absolute top-0 left-0"
               // Configuración extra para asegurar que YouTube funcione suave
               config={{
                 youtube: {
                   playerVars: { showinfo: 1 }
                 }
               }}
             />
           </div>
           {/* Mostramos también la descripción del video si existe */}
           {lesson.content && (
             <div className="prose dark:prose-invert max-w-none mt-4 p-4 bg-card rounded-lg border">
               <h4 className="text-sm font-semibold text-muted-foreground mb-2">Descripción de la lección:</h4>
               <p className="whitespace-pre-wrap">{lesson.content}</p>
             </div>
           )}
        </div>
      );
    
    case "document_url":
      return (
        <div className="space-y-4">
            {renderFileLink("Documento PDF/Word")}
            {lesson.content && (
                <Card>
                    <CardContent className="p-4 bg-muted/20">
                        <p className="whitespace-pre-wrap text-sm">{lesson.content}</p>
                    </CardContent>
                </Card>
            )}
        </div>
      );
      
    case "slides_url":
      return (
        <div className="space-y-4">
            {renderFileLink("Presentación")}
             {lesson.content && (
                <Card>
                    <CardContent className="p-4 bg-muted/20">
                        <p className="whitespace-pre-wrap text-sm">{lesson.content}</p>
                    </CardContent>
                </Card>
            )}
        </div>
      );

    case "text":
    default:
      return (
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 prose dark:prose-invert max-w-none">
            {renderTextContent()}
          </CardContent>
        </Card>
      );
  }
}