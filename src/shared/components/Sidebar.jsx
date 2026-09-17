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

      <nav className="sidebar__nav">
        {/* Sección principal. El operario SOLO ve "Turnos & Patio";
            el Administrador ve primero el Resumen. */}
        {isAdmin && (
          <>
            <p className="sidebar__group-title">Principal</p>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
              id="nav-dashboard"
            >
              <span className="sidebar__link-label">Resumen</span>
              <span className="sidebar__link-hint">Centro de control</span>
            </NavLink>
          </>
        )}

        <NavLink
          to="/turnos"
          className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
          id="nav-turnos"
        >
          <span className="sidebar__link-label">Turnos & Patio</span>
          <span className="sidebar__link-hint">
            {isAdmin ? "Supervisión en tiempo real" : "Mis turnos asignados"}
          </span>
        </NavLink>

        {isAdmin && (
          <>
            <p className="sidebar__group-title">Administración</p>
            <NavLink
              to="/usuarios"
              className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
              id="nav-usuarios"
            >
              <span className="sidebar__link-label">Usuarios</span>
              <span className="sidebar__link-hint">Operarios y administradores</span>
            </NavLink>

            <NavLink
              to="/servicios"
              className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
              id="nav-servicios"
            >
              <span className="sidebar__link-label">Servicios</span>
              <span className="sidebar__link-hint">Catálogo y fases</span>
            </NavLink>

            <NavLink
              to="/bahias"
              className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
              id="nav-bahias"
            >
              <span className="sidebar__link-label">Bahías</span>
              <span className="sidebar__link-hint">Estado del patio</span>
            </NavLink>

            <NavLink
              to="/admin/reservas"
              className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
              id="nav-reservas"
            >
              <span className="sidebar__link-label">Reservas</span>
              <span className="sidebar__link-hint">Citas del cliente</span>
            </NavLink>
          </>
        )}

        {/* Portales públicos: visibles solo para el Administrador.
            El operario únicamente ve "Turnos & Patio". */}
        {isAdmin && (
          <>
            <p className="sidebar__group-title">Portales públicos</p>
            <a
              href="/reservar"
              target="_blank"
              rel="noreferrer"
              className="sidebar__link"
              id="nav-portal-reservas"
            >
              <span className="sidebar__link-label">Portal Reservas</span>
              <span className="sidebar__link-hint">Vista pública cliente</span>
            </a>

            <a
              href="/seguimiento"
              target="_blank"
              rel="noreferrer"
              className="sidebar__link"
              id="nav-portal-seguimiento"
            >
              <span className="sidebar__link-label">Trazabilidad en Vivo</span>
              <span className="sidebar__link-hint">Vista de seguimiento</span>
            </a>

            <a
              href="/display"
              target="_blank"
              rel="noreferrer"
              className="sidebar__link"
              id="nav-display"
            >
              <span className="sidebar__link-label">Display de Patio</span>
              <span className="sidebar__link-hint">Pantalla pública</span>
            </a>
          </>
        )}
      </nav>

      <div className="sidebar__footer">
        {/* Perfil de la sesión: separado de las secciones de navegación */}
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
