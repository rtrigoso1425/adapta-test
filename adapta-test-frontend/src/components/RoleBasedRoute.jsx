import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * RoleBasedRoute
 * Componente protector de rutas basado en rol
 * 
 * Props:
 *   - requiredRoles: array de roles permitidos (ej. ['professor', 'admin'])
 *   - fallbackRoute: ruta a la que redirigir si no tiene permiso (default: '/dashboard')
 */
const RoleBasedRoute = ({ requiredRoles = [], fallbackRoute = "/dashboard" }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Si aún está cargando, mostrar nada o skeleton
  if (isLoading) {
    return null; // o <Skeleton /> si prefieres
  }

  // Si no hay usuario, redirigir a login (esto lo maneja PrivateRoute, pero por seguridad aquí también)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario tiene uno de los roles requeridos, renderizar la ruta
  if (requiredRoles.includes(user.role)) {
    return <Outlet />;
  }

  // Si no tiene el rol, redirigir al fallback
  return <Navigate to={fallbackRoute} replace />;
};

export default RoleBasedRoute;
