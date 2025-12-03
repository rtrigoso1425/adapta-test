import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { LessonContentRenderer } from './LessonContentRenderer';
import { LessonNavBar } from './LessonNavBar';
import { markLessonAsComplete } from '@/features/content/contentSlice'; //

export function LessonView({ lesson, lessonList, onBackToList, setViewingLesson }) {
  const dispatch = useDispatch();
  const { id: sectionId } = useParams();
  const { completedLessons } = useSelector((state) => state.content);

  const isCompleted = completedLessons.includes(lesson._id);

  const handleMarkComplete = () => {
    dispatch(
      markLessonAsComplete({
        moduleId: lesson.module,
        lessonId: lesson._id,
        sectionId,
      })
    );
  };

  const handleNavigate = (nextOrPrevLesson) => {
    if (nextOrPrevLesson) {
      setViewingLesson(nextOrPrevLesson);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* 1. Header de la Lección */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
      </div>

      {/* 2. Contenido de la Lección */}
      <div className="mb-24"> {/* Margen inferior para dejar espacio a la NavBar */}
        <LessonContentRenderer lesson={lesson} />
      </div>

      {/* 3. Barra de Navegación Fija */}
      <LessonNavBar
        lessonList={lessonList}
        currentLesson={lesson}
        isCompleted={isCompleted}
        onBackToList={onBackToList}
        onNavigate={handleNavigate}
        onMarkComplete={handleMarkComplete}
      />
    </div>
  );
}