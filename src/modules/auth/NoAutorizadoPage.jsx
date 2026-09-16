import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function NoAutorizadoPage() {
  const { user, role, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleVolver = () => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (isAdmin) {
      navigate("/operarios", { replace: true });
    } else {
      navigate("/turnos", { replace: true });
    }
  };

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-card__icon" aria-hidden="true">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h1>Acceso Denegado (403)</h1>
        <p className="unauthorized-card__message">
          No tienes los permisos necesarios para acceder a esta sección del sistema.
        </p>

        {isAuthenticated && (
          <div className="unauthorized-card__user-box">
            <span>Sesión iniciada como:</span>
            <strong>@{user}</strong>
            <span className="user-role-tag">{role}</span>
          </div>
        )}

        <div className="unauthorized-card__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleVolver}
            id="btn-unauthorized-back"
          >
            {isAdmin ? "Ir a Gestión de Operarios" : "Ir a Fila de Turnos"}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={logout}
              id="btn-unauthorized-logout"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
