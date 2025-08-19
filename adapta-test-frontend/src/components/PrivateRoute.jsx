import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
    const { user } = useSelector((state) => state.auth);

    // Si el usuario está logueado, muestra el contenido de la ruta (a través de Outlet).
    // Si no, lo redirige a la página de login.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;