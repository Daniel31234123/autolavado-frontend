import React from "react";
import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";

export function TurnoCard({ turno, onFinalizar, onCancelar }) {
  if (!turno) return null;

  const numeroTurno = turno.numero_turno || turno.numeroTurno || "T-000";
  const placa = turno.placa || "—";
  const tipoVehiculo = turno.tipo_vehiculo || turno.tipoVehiculo || "AUTO";
  const telefono = turno.telefono_cliente || turno.telefonoCliente || "—";
  const estadoActual = turno.estado_actual || turno.estadoActual || "RECEPCION";
  const fechaIngreso = turno.fecha_ingreso || turno.fechaIngreso;

  const horaFormateada = fechaIngreso
    ? new Date(fechaIngreso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : null;

  const estadoUpper = String(estadoActual).toUpperCase();
  const esActivo = estadoUpper === "RECEPCION" || estadoUpper === "EN_PROCESO";

  return (
    <article className="card turno-card" id={`card-turno-${turno.id}`}>
      <header className="turno-card__header">
        <span className="turno-card__numero font-mono">{numeroTurno}</span>
        <StatusBadge status={estadoActual} />
      </header>

      <div className="turno-card__placa-box">
        <span className="font-mono turno-card__placa">{placa}</span>
        <span className="turno-card__vehiculo-pill">{tipoVehiculo}</span>
      </div>

      <dl className="turno-card__details">
        <div>
          <dt>Teléfono</dt>
          <dd className="font-mono">{telefono}</dd>
        </div>
        {horaFormateada && (
          <div>
            <dt>Ingreso</dt>
            <dd className="font-mono">{horaFormateada}</dd>
          </div>
        )}
      </dl>

      {esActivo && (onFinalizar || onCancelar) && (
        <div className="turno-card__actions">
          {onFinalizar && (
            <button
              type="button"
              className="btn btn--sm btn--primary"
              onClick={() => onFinalizar(turno.id)}
              title="Finalizar turno y liberar bahía/operario"
              id={`btn-finalizar-turno-${turno.id}`}
            >
              Finalizar
            </button>
          )}
          {onCancelar && (
            <button
              type="button"
              className="btn btn--sm btn--danger-outline"
              onClick={() => onCancelar(turno.id)}
              title="Cancelar turno y liberar recursos"
              id={`btn-cancelar-turno-${turno.id}`}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </article>
  );
}
