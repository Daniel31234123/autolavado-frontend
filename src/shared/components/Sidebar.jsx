import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function Sidebar() {
  const { user, role, isAdmin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark">AE</span>
        <div>
          <p className="sidebar__brand-name">AutoLavado Express</p>
          <p className="sidebar__brand-sub">Sincelejo • Panel Operativo</p>
        </div>
      </div>

      <div className="sidebar__user">
        <div className="sidebar__user-avatar" aria-hidden="true">
          {user ? user.slice(0, 2).toUpperCase() : "US"}
        </div>
        <div className="sidebar__user-info">
          <p className="sidebar__user-name">{user}</p>
          <span className={`sidebar__user-role sidebar__user-role--${isAdmin ? "admin" : "operario"}`}>
            {role || "Usuario"}
          </span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {/* Administrador ve Operarios y Turnos; Operario ve SOLAMENTE Turnos */}
        {isAdmin && (
          <NavLink
            to="/operarios"
            className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
            id="nav-operarios"
          >
            <span className="sidebar__link-label">Operarios</span>
            <span className="sidebar__link-hint">Gestión del equipo</span>
          </NavLink>
        )}

        <NavLink
          to="/turnos"
          className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
          id="nav-turnos"
        >
          <span className="sidebar__link-label">Turnos</span>
          <span className="sidebar__link-hint">Registro y fila en vivo</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <button
          type="button"
          className="btn-logout"
          onClick={logout}
          id="btn-logout"
          title="Cerrar sesión de forma segura"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
