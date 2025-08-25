import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

// Importamos TODAS las acciones que este componente necesitará
import {
  getLessonsForModule,
  createLessonInModule,
  resetLessons,
  markLessonAsComplete,
  getCompletedLessons,
} from "./contentSlice";
import {
  getQuestionsForModule,
  createQuestion,
  reset as resetQuestions,
} from "../questions/questionSlice";

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

const ModuleItem = ({ module }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { id: sectionId } = useParams();

  // Obtenemos los estados de lecciones Y preguntas
  const { lessonsByModule, isLoadingLessons, completedLessons } = useSelector(
    (state) => state.content
  );
  const { questionsByModule, isLoading: isLoadingQuestions } = useSelector(
    (state) => state.questions
  );

  const lessons = lessonsByModule[module._id] || [];
  const questions = questionsByModule[module._id] || [];

  useEffect(() => {
    if (isOpen) {
      // Cuando se abre el módulo, pedimos tanto sus lecciones como sus preguntas
      dispatch(getLessonsForModule(module._id));

      if (user.role === "student") {
        dispatch(getCompletedLessons(sectionId));
      } else if (user.role === "professor") {
        // El profesor necesita las preguntas para su banco
        dispatch(getQuestionsForModule(module._id));
      }
    } else {
      // Cuando se cierra, limpiamos ambos estados para ese módulo
      dispatch(resetLessons(module._id));
      dispatch(resetQuestions()); // El reset de questions es global por ahora
    }
  }, [isOpen, dispatch, module._id, sectionId, user.role]);

  const handleMarkAsComplete = (lessonId) => {
    dispatch(
      markLessonAsComplete({ moduleId: module._id, lessonId, sectionId })
    );
  };

  return (
    <div
      style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}
    >
      <h3 onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer" }}>
        {module.title} {isOpen ? "[-]" : "[+]"}
      </h3>

      {/* Mostramos el botón de evaluación solo a los estudiantes */}
      {user && user.role === "student" && (
        <Link to={`/modules/${module._id}/evaluation`}>
          <button>Evaluar mis conocimientos</button>
        </Link>
      )}

      {/* Contenido desplegable */}
      {isOpen && (
        <div style={{ marginLeft: "20px", marginTop: "15px" }}>
          {/* Sección de Lecciones */}
          <section>
            <h4>Lecciones</h4>
            {isLoadingLessons ? (
              <p>Cargando...</p>
            ) : lessons.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 , marginTop: "10px"}}>
                {lessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson._id);
                  return (
                    <li
                      key={lesson._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5px 0",
                      }}
                    >
                      <span>{lesson.title}</span>

                      {/* 👇 AQUÍ ESTÁ LA CORRECCIÓN CLAVE 👇 */}
                      {/* Este botón solo se renderiza si el usuario es un estudiante */}
                      {user.role === "student" && (
                        <button
                          onClick={() => handleMarkAsComplete(lesson._id)}
                          disabled={isCompleted}
                        >
                          {isCompleted
                            ? "✅ Completado"
                            : "Marcar como completado"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No hay lecciones en este módulo.</p>
            )}
            {user && user.role === "professor" && (
              <>
                <AddLessonForm moduleId={module._id} />
                <hr style={{ margin: "20px 0" }} />
                <section>
                  <h4>Banco de Preguntas</h4>
                  {isLoadingQuestions ? (
                    <p>Cargando...</p>
                  ) : questions.length > 0 ? (
                    <ul>
                      {questions.map((q) => (
                        <li key={q._id}>{q.questionText}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay preguntas en este módulo.</p>
                  )}
                  <AddQuestionForm moduleId={module._id} />
                </section>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ModuleItem;
