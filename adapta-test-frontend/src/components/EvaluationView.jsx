import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  startEvaluation,
  submitAnswer,
  reset,
} from "../features/evaluation/evaluationSlice";
import { EvaluationSkeleton } from "@/components/EvaluationSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// NOTA: Este componente es casi idéntico a la `EvaluationPage` anterior,
// pero recibe props en lugar de usar hooks de router.

export function EvaluationView({ moduleId, onBackToList }) {
  const dispatch = useDispatch();
  
  const {
    session,
    currentQuestion,
    lastResult,
    isCompleted,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.evaluation);
  
  const { user } = useSelector((state) => state.auth);

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // --- 1. Inicio y Reseteo ---
  useEffect(() => {
    // Usa el moduleId de las props para iniciar la evaluación
    if (moduleId) {
      dispatch(startEvaluation(moduleId));
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, moduleId]); // Depende del prop

  // --- 2. Manejo de Errores ---
  useEffect(() => {
    if (isError) {
      alert(message);
      onBackToList(); // Vuelve a la lista si hay un error
    }
  }, [isError, message, onBackToList]);

  // --- 3. Lógica de Feedback y Transición ---
  useEffect(() => {
    if (lastResult) {
      setFeedback(lastResult.isCorrect ? 'correct' : 'incorrect');
      const timer = setTimeout(() => {
        setFeedback(null);
        setSelectedOptionId(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastResult, session?.sessionId]);

  // --- 4. Handler para Enviar Respuesta ---
  const handleAnswerSubmit = (optionId) => {
    if (feedback || isLoading) return; 
    setSelectedOptionId(optionId);
    dispatch(submitAnswer({
      sessionId: session.sessionId,
      answerData: {
        questionId: currentQuestion._id,
        answerId: optionId,
      },
    }));
  };

  // --- 5. Cálculo del Progreso ---
  const questionsAnswered = (session?.score?.correct || 0) + (session?.score?.incorrect || 0);
  const totalQuestions = user?.institution?.type === 'high_school' ? 10 : 15;
  const progressPercent = (questionsAnswered / totalQuestions) * 100;

  // --- RENDERIZADO CONDICIONAL ---

  // Estado 1: Cargando la primera pregunta
  if (isLoading && !currentQuestion && !isCompleted) {
    return <EvaluationSkeleton />;
  }

  // Estado 2: Evaluación Completada
  if (isCompleted && session) {
    // Modificamos el botón de "Volver" para usar el prop
    return (
      <EvaluationComplete 
        session={session} 
        onBackToList={onBackToList} 
      />
    );
  }

  // Estado 3: Mostrando una Pregunta
  if (currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Botón para salir de la evaluación */}
        <Button variant="outline" size="sm" className="mb-4" onClick={onBackToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Contenido
        </Button>

        <Card 
          key={currentQuestion._id}
          className="animate-in fade-in duration-500"
        >
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardDescription>Pregunta {questionsAnswered + 1} de {totalQuestions}</CardDescription>
              {isLoading && <span className="text-sm text-muted-foreground">Verificando...</span>}
            </div>
            <Progress value={progressPercent} className="h-2 mb-4" />
            <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option._id;
              
              let variant = "outline";
              let statusClass = "";
              if (isSelected && feedback === 'correct') {
                variant = "default";
                statusClass = "bg-green-600 hover:bg-green-700 text-white";
              } else if (isSelected && feedback === 'incorrect') {
                variant = "default";
                statusClass = "bg-red-600 hover:bg-red-700 text-white";
              }

              return (
                <Button
                  key={option._id}
                  variant={variant}
                  className={cn("w-full h-auto justify-start p-4 text-left whitespace-normal", statusClass)}
                  onClick={() => handleAnswerSubmit(option._id)}
                  disabled={isLoading || feedback} 
                >
                  {option.text}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado Fallback
  return <EvaluationSkeleton />;
}

// Modificación para el componente de Completado, para que acepte `onBackToList`
function EvaluationComplete({ session, onBackToList }) { 
  const finalScore = session.finalScore || { correct: 0, incorrect: 0 };
  const finalMastery = session.finalMastery || 0;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">¡Evaluación Completada!</CardTitle>
          <CardDescription>Estos son tus resultados finales.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Puntuación */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-secondary rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{finalScore.correct}</p>
              <p className="text-sm text-muted-foreground">Correctas</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{finalScore.incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrectas</p>
            </div>
          </div>

          {/* Maestría */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-primary flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Nivel de Maestría
              </span>
              <span className="text-lg font-bold text-primary">
                {finalMastery.toFixed(0)}%
              </span>
            </div>
            <Progress value={finalMastery} className="h-3" />
          </div>

          <Button className="w-full" onClick={onBackToList}> {/* <-- Botón actualizado */}
            Volver al Curso
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}