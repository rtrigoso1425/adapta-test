import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  startEvaluation,
  submitAnswer,
  reset,
} from "../features/evaluation/evaluationSlice";

const EvaluationPage = () => {
  const { moduleId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    session,
    currentQuestion,
    lastResult,
    isCompleted,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.evaluation);

  useEffect(() => {
    dispatch(startEvaluation(moduleId));
    return () => {
      dispatch(reset());
    };
  }, [dispatch, moduleId]);

  useEffect(() => {
    if (isError) {
      alert(message);
      navigate(-1); // Volver a la página anterior si hay un error
    }
  }, [isError, message, navigate]);

  const handleAnswerSubmit = (optionId) => {
    if (isLoading) return; // Evitar doble click
    const answerData = {
      questionId: currentQuestion._id,
      answerId: optionId,
    };
    dispatch(submitAnswer({ sessionId: session.sessionId, answerData }));
  };

  if (isLoading && !currentQuestion && !isCompleted) {
    return <h1>Iniciando evaluación...</h1>;
  }

  if (isCompleted) {
    // Añadimos una verificación para asegurarnos de que session.finalScore exista antes de usarlo
    if (!session || !session.finalScore) {
      return <h1>Calculando resultados finales...</h1>;
    }

    return (
      <div>
        <h1>¡Evaluación Completada!</h1>
        <h3>Resultado Final:</h3>
        <p>Respuestas Correctas: {session.finalScore.correct}</p>
        <p>Respuestas Incorrectas: {session.finalScore.incorrect}</p>
        <p>Nivel de Maestría Alcanzado: {session.finalMastery.toFixed(2)}%</p>
        <button onClick={() => navigate(-1)}>Volver al Curso</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Evaluación en Progreso</h1>
      {currentQuestion ? (
        <div>
          <h3>{currentQuestion.questionText}</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {currentQuestion.options.map((option) => (
              <button
                key={option._id}
                onClick={() => handleAnswerSubmit(option._id)}
                disabled={isLoading}
              >
                {option.text}
              </button>
            ))}
          </div>
          {isLoading && <p>Procesando respuesta...</p>}
          {lastResult && (
            <p
              style={{
                fontWeight: "bold",
                color: lastResult.isCorrect ? "green" : "red",
              }}
            >
              Tu última respuesta fue:{" "}
              {lastResult.isCorrect ? "¡Correcta!" : "Incorrecta"}
            </p>
          )}
        </div>
      ) : (
        <p>Cargando pregunta...</p>
      )}
    </div>
  );
};

export default EvaluationPage;
