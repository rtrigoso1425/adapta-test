import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonItem } from "@/components/LessonItem";
import {
  createLessonInModule,
} from "./contentSlice";
import {
  getQuestionsForModule,
  createQuestion,
} from "../questions/questionSlice";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, BookOpen, HelpCircle, Play } from "lucide-react";

// ===================================================================================
//  FORMULARIO: Añadir Lección (Mejorado)
// ===================================================================================
const AddLessonForm = ({ moduleId, onCancel }) => {
  const [title, setTitle] = useState("");
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.content);

  const onSubmit = (e) => {
    e.preventDefault();
    const lessonData = { title, content: "Contenido de ejemplo..." };
    dispatch(createLessonInModule({ moduleId, lessonData }));
    setTitle("");
    onCancel();
  };

  return (
    <Card className="p-4 bg-muted/30 border-2 border-dashed border-primary/30 mx-4 mb-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`lesson-title-${moduleId}`} className="text-sm font-medium text-foreground">
            Título de la nueva lección
          </Label>
          <Input
            id={`lesson-title-${moduleId}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Introducción a JavaScript"
            className="w-full bg-background"
            autoFocus
            required
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="flex-1"
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? "Añadiendo..." : "Añadir Lección"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

// ===================================================================================
//  FORMULARIO: Añadir Pregunta (Mejorado)
// ===================================================================================
const AddQuestionForm = ({ moduleId, onCancel }) => {
  const [questionText, setQuestionText] = useState("");
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.questions);

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
    onCancel();
  };

  return (
    <Card className="p-4 bg-muted/30 border-2 border-dashed border-primary/30 mx-4 mb-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${moduleId}`} className="text-sm font-medium text-foreground">
            Texto de la nueva pregunta
          </Label>
          <Input
            id={`question-text-${moduleId}`}
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Ej. ¿Cómo se llama lo que da wifi?"
            className="w-full bg-background"
            autoFocus
            required
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="flex-1"
            disabled={!questionText.trim() || isLoading}
          >
            {isLoading ? "Añadiendo..." : "Añadir Pregunta"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: ModuleItem (Mejorado)
// ===================================================================================
export default function ModuleItem({ module, onSelectLesson, onStartEvaluation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { id: sectionId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const { lessonsByModule, isLoadingLessons, completedLessons } = useSelector(
    (state) => state.content
  );
  const { questionsByModule, isLoading: isLoadingQuestions } = useSelector(
    (state) => state.questions
  );

  const lessons = lessonsByModule[module._id] || [];
  const questions = questionsByModule[module._id] || [];
  
  const areLessonsLoading = isLoadingLessons && !lessonsByModule[module._id];

  const completedInModule = lessons.filter(l => completedLessons.includes(l._id)).length;
  const totalLessons = lessons.length;

  const onModuleOpenChange = (isOpenState) => {
    setIsOpen(isOpenState);
    
    if (isOpenState && user.role === "professor" && !questionsByModule[module._id]) {
      dispatch(getQuestionsForModule(module._id));
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onModuleOpenChange}
      className="border border-border rounded-lg bg-card hover:border-primary/50 transition-colors overflow-hidden"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors [&[data-state=open]>svg]:rotate-180">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4 gap-2">
          <span className="text-base font-semibold text-foreground text-left">{module.title}</span>
          {user.role === "student" && (
            <div className="flex items-center gap-2">
              {areLessonsLoading ? (
                <Skeleton className="h-4 w-24 rounded-md" />
              ) : (
                <span className="text-sm text-muted-foreground font-normal">
                  {completedInModule} / {totalLessons} lecciones
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground" />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="border-t border-border">
          {areLessonsLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : (
            <>
              {/* ============= VISTA DE ESTUDIANTE ============= */}
              {user.role === "student" && (
                <div className="p-4 space-y-3">
                  <Button 
                    variant="default" 
                    className="w-full sm:w-auto flex items-center gap-2"
                    onClick={() => onStartEvaluation(module._id)}
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Evaluación Adaptativa
                  </Button>
                  
                  <div className="space-y-2">
                    {lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <LessonItem
                          key={lesson._id}
                          lesson={lesson}
                          isCompleted={completedLessons.includes(lesson._id)}
                          onClick={() => onSelectLesson(lesson, lessons)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay lecciones disponibles aún</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* ============= VISTA DE PROFESOR ============= */}
              {user.role === "professor" && (
                <div className="p-4 space-y-6">
                  {/* Sección de Lecciones */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Lecciones</h4>
                    </div>

                    {lessons.length > 0 ? (
                      <div className="space-y-2">
                        {lessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className="p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors"
                          >
                            <p className="text-sm text-foreground">{lesson.title}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic px-2">
                        No hay lecciones aún
                      </p>
                    )}

                    {showLessonForm ? (
                      <AddLessonForm 
                        moduleId={module._id} 
                        onCancel={() => setShowLessonForm(false)}
                      />
                    ) : (
                      <Button
                        onClick={() => setShowLessonForm(true)}
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed hover:border-solid"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Lección
                      </Button>
                    )}
                  </div>

                  {/* Sección de Banco de Preguntas */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 px-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Banco de Preguntas</h4>
                    </div>

                    {isLoadingQuestions ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    ) : questions.length > 0 ? (
                      <div className="space-y-2">
                        {questions.map((q) => (
                          <div
                            key={q._id}
                            className="p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors"
                          >
                            <p className="text-sm text-foreground">{q.questionText}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic px-2">
                        No hay preguntas aún
                      </p>
                    )}

                    {showQuestionForm ? (
                      <AddQuestionForm 
                        moduleId={module._id} 
                        onCancel={() => setShowQuestionForm(false)}
                      />
                    ) : (
                      <Button
                        onClick={() => setShowQuestionForm(true)}
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed hover:border-solid"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Pregunta
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}