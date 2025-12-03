import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonItem } from "@/components/LessonItem"; // <-- Importar
import {
  createLessonInModule,
} from "./contentSlice";
import {
  getQuestionsForModule,
  createQuestion,
} from "../questions/questionSlice";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";


const AddLessonForm = ({ moduleId }) => {
  const [title, setTitle] = useState("");
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();
    const lessonData = { title, content: "Contenido de ejemplo..." };
    dispatch(createLessonInModule({ moduleId, lessonData }));
    setTitle("");
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: "10px", marginLeft: "20px" }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la nueva lección"
        required
      />
      <button type="submit">Añadir Lección</button>
    </form>
  );
};

const AddQuestionForm = ({ moduleId }) => {
  const [questionText, setQuestionText] = useState("");
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();
    const questionData = {
      questionText,
      options: [
        { text: "Respuesta Correcta", isCorrect: true },
        { text: "Opción B", isCorrect: false },
      ],
      difficulty: 1,
    };
    dispatch(createQuestion({ moduleId, questionData }));
    setQuestionText("");
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: "10px" }}>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Texto de la nueva pregunta"
        required
      />
      <button type="submit">Añadir Pregunta</button>
    </form>
  );
};

export default function ModuleItem({ module, onSelectLesson, onStartEvaluation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // eslint-disable-next-line no-unused-vars
  const { id: sectionId } = useParams(); // Ya no lo necesita para `getCompletedLessons`
  const [isOpen, setIsOpen] = useState(false);

  const { lessonsByModule, isLoadingLessons, completedLessons } = useSelector(
    (state) => state.content
  );
  const { questionsByModule, isLoading: isLoadingQuestions } = useSelector(
    (state) => state.questions
  );

  const lessons = lessonsByModule[module._id] || [];
  const questions = questionsByModule[module._id] || [];
  
  // --- LÓGICA DE CARGA MEJORADA ---
  // `areLessonsLoading` es true si el slice global está cargando Y
  // los datos de este módulo específico aún no han llegado.
  const areLessonsLoading = isLoadingLessons && !lessonsByModule[module._id];

  const completedInModule = lessons.filter(l => completedLessons.includes(l._id)).length;
  const totalLessons = lessons.length;
  // const progress = ...

  // --- FUNCIÓN SIMPLIFICADA ---
  const onModuleOpenChange = (isOpenState) => {
    setIsOpen(isOpenState);
    
    // La carga de lecciones del estudiante ya no está aquí
    
    // Mantenemos la carga de preguntas para el *profesor* (lazy loading)
    if (isOpenState && user.role === "professor" && !questionsByModule[module._id]) {
      dispatch(getQuestionsForModule(module._id));
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onModuleOpenChange}
      className="border-b"
    >
      <CollapsibleTrigger className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full [&[data-state=open]>svg]:rotate-180">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4">
          <span className="text-base font-medium text-left">{module.title}</span>
          {user.role === "student" && (
            <span className="text-sm text-muted-foreground font-normal">
              {/* --- 1. SKELETON PARA EL CONTADOR --- */}
              {areLessonsLoading ? (
                <Skeleton className="h-4 w-24 rounded-md" />
              ) : (
                <span>{completedInModule} / {totalLessons} lecciones</span>
              )}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="pb-4 pt-0">
           {/* --- 2. SKELETON PARA EL CONTENIDO --- */}
           {areLessonsLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
           ) : (
            <>
              {/* ---- Vista de ESTUDIANTE ---- */}
              {user.role === "student" && (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="ml-4 mb-2"
                    onClick={() => onStartEvaluation(module._id)} // <-- Llama al handler
                  >
                    Iniciar Evaluación Adaptativa
                  </Button>
                  {lessons.map((lesson) => (
                    <LessonItem
                      key={lesson._id}
                      lesson={lesson}
                      isCompleted={completedLessons.includes(lesson._id)}
                      // 3. Pasa la lección y la lista de lecciones al handler
                      onClick={() => onSelectLesson(lesson, lessons)}
                    />
                  ))}
                </div>
              )}
              
              {/* ---- Vista de PROFESOR ---- */}
              {user.role === "professor" && (
                // ... (Contenido del profesor sin cambios)
                <div className="bg-muted/50 rounded-md">
                  <h4 className="p-4 text-sm font-semibold">Lecciones</h4>
                  {lessons.map((lesson) => (
                    <div key={lesson._id} className="p-3 border-t">
                      {lesson.title}
                    </div>
                  ))}
                  <AddLessonForm moduleId={module._id} />

                  <h4 className="p-4 text-sm font-semibold border-t">Banco de Preguntas</h4>
                  {isLoadingQuestions ? <p className="p-4">Cargando...</p> :
                    questions.map((q) => (
                      <div key={q._id} className="p-3 border-t text-xs">
                        {q.questionText}
                      </div>
                    ))
                  }
                  <AddQuestionForm moduleId={module._id} />
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}