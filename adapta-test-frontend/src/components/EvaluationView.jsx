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
import { ArrowLeft, CheckCircle2, XCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (moduleId) {
      dispatch(startEvaluation(moduleId));
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, moduleId]);

  // --- 2. Manejo de Errores ---
  useEffect(() => {
    if (isError) {
      alert(message);
      onBackToList();
    }
  }, [isError, message, onBackToList]);

  // --- 3. Lógica de Feedback ---
  useEffect(() => {
    if (lastResult) {
      // Activamos el color (verde/rojo)
      setFeedback(lastResult.isCorrect ? 'correct' : 'incorrect');
      
      const timer = setTimeout(() => {
        // Al terminar el tiempo, limpiamos el feedback
        setFeedback(null);
        setSelectedOptionId(null);
        // NOTA: Al limpiar 'feedback', el componente se re-renderizará
        // y el número de pregunta avanzará automáticamente gracias a la lógica de abajo.
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastResult, session?.sessionId]);

  // --- 4. Handler para Enviar ---
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

  // --- 5. LÓGICA BLINDADA PARA EL NÚMERO DE PREGUNTA ---
  
  // A) Calcular totales seguros (evita NaN o undefined)
  const scoreCorrect = session?.score?.correct || 0;
  const scoreIncorrect = session?.score?.incorrect || 0;
  const totalAnswered = scoreCorrect + scoreIncorrect; // Total respondidas según base de datos

  // B) Calcular el número visual
  // Si 'feedback' es true: Acabamos de responder. El servidor ya sumó +1 al score,
  // pero visualmente seguimos en la pregunta que acabamos de hacer.
  // Por tanto, el número es igual a 'totalAnswered'.
  // Si 'feedback' es false: Ya pasamos a la siguiente. El número es 'totalAnswered + 1'.
  let calculatedNumber = feedback ? totalAnswered : totalAnswered + 1;

  // C) Seguridad anti-cero
  // Nunca mostrar "Pregunta 0". Mínimo 1.
  const displayQuestionNumber = Math.max(1, calculatedNumber);

  // D) Progreso
  const totalQuestions = user?.institution?.type === 'high_school' ? 10 : 15;
  // Usamos totalAnswered para la barra de progreso (es más preciso)
  const progressPercent = (totalAnswered / totalQuestions) * 100;


  // --- RENDERIZADO CONDICIONAL ---

  // 1. Cargando inicial (sin sesión o sin pregunta)
  if ((isLoading && !currentQuestion && !isCompleted) || !session) {
    return <EvaluationSkeleton />;
  }

  // 2. Completado
  if (isCompleted) {
    return (
      <EvaluationComplete 
        session={session} 
        onBackToList={onBackToList} 
      />
    );
  }

  // 3. Vista de Pregunta
  if (currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" size="sm" className="mb-4" onClick={onBackToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Contenido
        </Button>

        <Card key={currentQuestion._id} className="animate-in fade-in duration-500">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardDescription>
                {/* Aquí usamos la variable segura */}
                Pregunta {displayQuestionNumber} de {totalQuestions}
              </CardDescription>
              {isLoading && <span className="text-sm text-muted-foreground">Procesando...</span>}
            </div>
            {/* La barra de progreso crece suavemente */}
            <Progress value={progressPercent} className="h-2 mb-4 transition-all duration-500" />
            <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option._id;
              
              let variant = "outline";
              let statusClass = "";
              // Lógica de colores basada en el estado 'feedback'
              if (isSelected && feedback === 'correct') {
                variant = "default";
                statusClass = "bg-green-600 hover:bg-green-700 text-white border-green-600";
              } else if (isSelected && feedback === 'incorrect') {
                variant = "default";
                statusClass = "bg-red-600 hover:bg-red-700 text-white border-red-600";
              }

              return (
                <Button
                  key={option._id}
                  variant={variant}
                  className={cn("w-full h-auto justify-start p-4 text-left whitespace-normal", statusClass)}
                  onClick={() => handleAnswerSubmit(option._id)}
                  disabled={isLoading || feedback !== null} 
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

  return <EvaluationSkeleton />;
}

// Componente de Completado (Sin cambios, solo para referencia)
function EvaluationComplete({ session, onBackToList }) { 
  const finalScore = session.finalScore || { correct: 0, incorrect: 0 };
  const finalMastery = session.finalMastery || 0;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">¡Evaluación Completada!</CardTitle>
          <CardDescription>Resultados finales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <Button className="w-full" onClick={onBackToList}>
            Volver al Curso
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}