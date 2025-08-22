import { useSelector } from "react-redux";
import ProfessorDashboard from "../features/dashboard/ProfessorDashboard";
import StudentDashboard from "../features/dashboard/StudentDashboard";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import CoordinatorDashboard from "../features/dashboard/CoordinatorDashboard";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <h1>Cargando...</h1>;
  }

  // Renderizamos un dashboard diferente basado en el rol del usuario
  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "coordinator":
      return <CoordinatorDashboard />;
    case "professor":
      return <ProfessorDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <h1>Dashboard no disponible para tu rol.</h1>;
  }
};

export default DashboardPage;
