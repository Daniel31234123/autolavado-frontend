import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader } from "../shared/components/Loader.jsx";

/**
 * Protege rutas que requieren roles específicos (RFF-003).
 * Si no está autenticado -> redirige a /login.
 * Si está autenticado pero no tiene el rol permitido -> redirige a /no-autorizado.
 */
export function RoleRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader label="Verificando permisos..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  const userRoleNormalized = (role || "").toUpperCase();

  if (!normalizedAllowed.includes(userRoleNormalized)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
