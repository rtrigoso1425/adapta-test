import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCourses, reset } from "../features/courses/courseSlice";
import { Link } from "react-router-dom";

const CoursesPage = () => {
  const dispatch = useDispatch();
  const { courses, isLoading, isError, message } = useSelector(
    (state) => state.courses
  );

  // useEffect se ejecuta cuando el componente se monta
  useEffect(() => {
    if (isError) {
      console.log(message); // Mostraremos un alert o toast más adelante
    }
    // Hacemos la petición para obtener los cursos
    dispatch(getCourses());

    // Cuando el componente se desmonte, limpiamos el estado
    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch]);

  if (isLoading) {
    return <h1>Cargando cursos...</h1>;
  }

  return (
    <div>
      <h1>Catálogo de Cursos</h1>
      <section>
        {courses.length > 0 ? (
          <div>
            {courses.map((course) => (
              <Link
                to={`/courses/${course._id}`}
                key={course._id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    margin: "10px 0",
                  }}
                >
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <h3>No hay cursos para mostrar</h3>
        )}
      </section>
    </div>
  );
};

export default CoursesPage;
