import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getMyEnrollments, reset } from "../enrollments/enrollmentSlice";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrollments, isLoading } = useSelector((state) => state.enrollments);

  useEffect(() => {
    dispatch(getMyEnrollments());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (isLoading) return <h3>Cargando tus cursos...</h3>;

  return (
    <div>
      <h1>Bienvenido, {user.name}</h1>
      <h2>Mis Cursos Matriculados</h2>
      {enrollments.length > 0 ? (
    enrollments.map((enrollment) => (
        <div key={enrollment._id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0' }}>
            {/* CAMBIO: Accedemos a los datos a través de 'section' */}
            <h3>{enrollment.section.course.title}</h3>
            <h4>Sección: {enrollment.section.sectionCode}</h4>
            <p>Instructor: {enrollment.section.instructor.name}</p>
            <small>Ciclo: {enrollment.section.academicCycle.name}</small> <br />
            {/* Este enlace nos llevará a la vista de aprendizaje de esa sección específica */}
            <Link to={`/learn/section/${enrollment.section._id}`}>Ir al Curso</Link>
        </div>
    ))
) : (
    <p>No estás matriculado en ninguna sección para el ciclo actual.</p>
)}
    </div>
  );
};

export default StudentDashboard;
