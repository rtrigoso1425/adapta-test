import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * PrivateRoute protege rutas anidadas.
 * Si no hay usuario (o token) redirige a /login y pasa la ruta origen en state.from
 */
export default function PrivateRoute() {
  const { user } = useSelector((state) => state.auth || {});
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}