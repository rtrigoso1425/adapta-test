import React from 'react';
import VideoPlayer from "@/components/ui/video-player"; //
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Link } from "lucide-react";

// Suponiendo que el contenido de texto puede ser Markdown o HTML
// import { Markdown } from 'react-markdown'; // (Habría que instalar 'react-markdown')

export function LessonContentRenderer({ lesson }) {
  
  // Renderizador de contenido de texto
  const renderTextContent = () => {
    // Si tienes Markdown o HTML:
    // return <Markdown>{lesson.content}</Markdown>;
    
    // Para texto plano:
    return <p className="text-foreground/90 whitespace-pre-wrap">{lesson.content}</p>;
  };

  // Renderizador para otros tipos de archivos
  const renderFileLink = (typeName) => (
    <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg">
      <FileText className="h-16 w-16 text-muted-foreground" />
      <p className="mt-4 text-lg font-semibold">Contenido: {typeName}</p>
      <a 
        href={lesson.fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
      >
        Descargar Archivo <Link className="h-4 w-4" />
      </a>
    </div>
  );

  switch (lesson.contentType) {
    case "video_url":
      return <VideoPlayer src={lesson.fileUrl} />; //
    
    case "document_url":
      return renderFileLink("Documento");
      
    case "slides_url":
      return renderFileLink("Presentación");

    case "text":
    default:
      return (
        <Card>
          <CardContent className="p-6 prose dark:prose-invert max-w-none">
            {renderTextContent()}
          </CardContent>
        </Card>
      );
  }
}