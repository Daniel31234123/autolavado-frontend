import React, { useState } from "react";
import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";

export function TurnoCard({ turno, onFinalizar, onCancelar, onActualizarFase }) {
  if (!turno) return null;

  const [loadingFase, setLoadingFase] = useState(false);

  const numeroTurno = turno.numero_turno || turno.numeroTurno || "T-000";
  const placa = turno.placa || "—";
  const tipoVehiculo = turno.tipo_vehiculo || turno.tipoVehiculo || "AUTO";
  const telefono = turno.telefono_cliente || turno.telefonoCliente || "—";
  const estadoActual = turno.estado_actual || turno.estadoActual || "EN_COLA";
  const fechaIngreso = turno.fecha_ingreso || turno.fechaIngreso;

  const horaFormateada = fechaIngreso
    ? new Date(fechaIngreso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : null;

  const estadoUpper = String(estadoActual).toUpperCase();
  const esFinalizado = estadoUpper === "FINALIZADO" || estadoUpper === "CANCELADO";

  const cambiarFase = async (fase) => {
    if (!onActualizarFase) return;
    setLoadingFase(true);
    try {
      await onActualizarFase(turno.id, fase);
    } finally {
      setLoadingFase(false);
    }
  };

  return (
    <article className="card turno-card" id={`card-turno-${turno.id}`} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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

      {/* Controles de Fases para Operario (RF-CL-02) */}
      {!esFinalizado && onActualizarFase && (
        <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "10px", marginTop: "4px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
            FASES DE LAVADO (TIEMPO REAL):
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loadingFase || estadoUpper === "ENJABONADO"}
              onClick={() => cambiarFase("ENJABONADO")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                background: estadoUpper === "ENJABONADO" ? "var(--color-primary)" : "#fff",
                color: estadoUpper === "ENJABONADO" ? "#fff" : "var(--color-ink)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🧼 Enjabonar
            </button>

            <button
              type="button"
              disabled={loadingFase || estadoUpper === "ENJUAGADO"}
              onClick={() => cambiarFase("ENJUAGADO")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                background: estadoUpper === "ENJUAGADO" ? "var(--color-primary)" : "#fff",
                color: estadoUpper === "ENJUAGADO" ? "#fff" : "var(--color-ink)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🚿 Enjuagar
            </button>

            <button
              type="button"
              disabled={loadingFase || estadoUpper === "SECADO"}
              onClick={() => cambiarFase("SECADO")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                background: estadoUpper === "SECADO" ? "var(--color-primary)" : "#fff",
                color: estadoUpper === "SECADO" ? "#fff" : "var(--color-ink)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              💨 Secar
            </button>

            <button
              type="button"
              disabled={loadingFase || estadoUpper === "LISTO"}
              onClick={() => cambiarFase("LISTO")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #22c55e",
                background: estadoUpper === "LISTO" ? "#22c55e" : "#dcfce7",
                color: estadoUpper === "LISTO" ? "#fff" : "#15803d",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🚗 Listo para Recoger
            </button>
          </div>
        </div>
      )}

      {!esFinalizado && (onFinalizar || onCancelar) && (
        <div className="turno-card__actions" style={{ marginTop: "4px" }}>
          {onFinalizar && (
            <button
              type="button"
              className="btn btn--sm btn--primary"
              onClick={() => onFinalizar(turno.id)}
              title="Completar entrega y finalizar"
              id={`btn-finalizar-turno-${turno.id}`}
            >
              Entregar / Finalizar
            </button>
          )}
          {onCancelar && (
            <button
              type="button"
              className="btn btn--sm btn--danger-outline"
              onClick={() => onCancelar(turno.id)}
              title="Cancelar turno"
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
