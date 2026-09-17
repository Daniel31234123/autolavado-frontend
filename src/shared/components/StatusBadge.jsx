import React from "react";

const STATUS_CONFIG = {
  ACTIVO: { label: "Activo", className: "badge--positive" },
  Activo: { label: "Activo", className: "badge--positive" },
  INACTIVO: { label: "Inactivo", className: "badge--danger" },
  Inactivo: { label: "Inactivo", className: "badge--danger" },
  OCUPADO: { label: "Ocupado", className: "badge--warning" },
  Ocupado: { label: "Ocupado", className: "badge--warning" },
  DISPONIBLE: { label: "Disponible", className: "badge--positive" },
  Disponible: { label: "Disponible", className: "badge--positive" },
  MANTENIMIENTO: { label: "Mantenimiento", className: "badge--neutral" },
  CONFIRMADA: { label: "Confirmada", className: "badge--info" },
  PENDIENTE: { label: "Pendiente", className: "badge--warning" },
  RESERVADA: { label: "Reservada", className: "badge--info" },
  EN_ATENCION: { label: "En atención", className: "badge--warning" },
  RECEPCION: { label: "En Espera", className: "badge--info" },
  EN_COLA: { label: "En Cola", className: "badge--info" },
  EN_PATIO: { label: "En Patio", className: "badge--warning" },
  LAVADO: { label: "En Proceso", className: "badge--warning" },
  FINALIZADO: { label: "Finalizado", className: "badge--positive" },
  CANCELADO: { label: "Cancelado", className: "badge--danger" },
};

export function StatusBadge({ status, label, tone }) {
  const normalizedKey = status ? String(status).toUpperCase() : "";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[normalizedKey] || {
    label: label || status || "Estado",
    className: tone ? `badge--${tone}` : "badge--neutral",
  };

  return (
    <span className={`badge ${config.className}`}>
      <span className="badge__dot" aria-hidden="true" />
      {label || config.label}
    </span>
  );
}
