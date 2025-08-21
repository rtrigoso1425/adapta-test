import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

// Importamos TODAS las acciones que este componente necesitará
import {
  getLessonsForModule,
  createLessonInModule,
  resetLessons,
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

  // Obtenemos los estados de lecciones Y preguntas
  const { lessonsByModule, isLoadingLessons } = useSelector(
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
      dispatch(getQuestionsForModule(module._id));
    } else {
      // Cuando se cierra, limpiamos ambos estados para ese módulo
      dispatch(resetLessons(module._id));
      dispatch(resetQuestions()); // El reset de questions es global por ahora
    }
  }, [isOpen, dispatch, module._id]);

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
              <ul>
                {lessons.map((lesson) => (
                  <li key={lesson._id}>{lesson.title}</li>
                ))}
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
