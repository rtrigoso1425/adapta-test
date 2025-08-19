import { useSelector } from 'react-redux';
import ProfessorDashboard from '../features/dashboard/ProfessorDashboard';
import StudentDashboard from '../features/dashboard/StudentDashboard';

const DashboardPage = () => {
    const { user } = useSelector((state) => state.auth);

    // Si el usuario aún no ha cargado, podemos mostrar un loader o nada.
    if (!user) {
        return <h1>Cargando...</h1>;
    }

    // Renderizamos un dashboard diferente basado en el rol del usuario
    switch (user.role) {
        case 'professor':
            return <ProfessorDashboard />;
        case 'student':
            return <StudentDashboard />;
        // Podríamos añadir casos para 'admin', 'coordinator', etc.
        default:
            return <h1>Dashboard no disponible para tu rol.</h1>;
    }
};

export default DashboardPage;
