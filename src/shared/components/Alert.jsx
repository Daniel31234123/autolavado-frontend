import React from "react";

const ICONOS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  ),
  danger: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

/**
 * Alerta visual reutilizable con icono, título opcional y mensaje.
 * Variantes: "success" | "danger" | "warning" | "info".
 */
export function Alert({ variant = "info", title, children, onClose, className = "", style }) {
  if (!children && !title) return null;

  return (
    <div
      className={`alert alert--rich alert--${variant}${className ? ` ${className}` : ""}`}
      role={variant === "danger" ? "alert" : "status"}
      style={style}
    >
      <span className="alert__icon" aria-hidden="true">{ICONOS[variant] || ICONOS.info}</span>
      <div className="alert__content">
        {title && <strong className="alert__title">{title}</strong>}
        {children && <div className="alert__message">{children}</div>}
      </div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar mensaje">
          &times;
        </button>
      )}
    </div>
  );
}
