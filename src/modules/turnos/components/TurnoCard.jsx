import React, { useState } from "react";
import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";

const FASES_FALLBACK = ["POR_INICIAR", "ENJABONADO", "ENJUAGADO", "SECADO", "LISTO"];

export function TurnoCard({
  turno,
  onFinalizar,
  onCancelar,
  onActualizarFase,
  onAsignarBahia,
  bahias = [],
  servicios = [],
}) {
  const [loadingFase, setLoadingFase] = useState(false);

  if (!turno) return null;

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

  // RN-05: fases dinámicas según el catálogo del servicio contratado
  const idServicio = turno.id_servicio ?? turno.idServicio;
  const servicio = servicios.find((s) => Number(s.id) === Number(idServicio));
  const fases = Array.isArray(servicio?.fases) && servicio.fases.length > 0
    ? servicio.fases
    : FASES_FALLBACK;

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
            {fases.map((fase) => {
              const clave = String(fase).toUpperCase();
              const esActiva = estadoUpper === clave;
              const esFinal = clave === "LISTO" || clave === "LISTO_PARA_RECOGER";
              return (
                <button
                  key={clave}
                  type="button"
                  disabled={loadingFase || esActiva}
                  onClick={() => cambiarFase(clave)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: esFinal ? "1px solid #22c55e" : "1px solid #cbd5e1",
                    background: esFinal
                      ? esActiva
                        ? "#22c55e"
                        : "#dcfce7"
                      : esActiva
                      ? "var(--color-primary)"
                      : "#fff",
                    color: esFinal ? (esActiva ? "#fff" : "#15803d") : esActiva ? "#fff" : "var(--color-ink)",
                    cursor: "pointer",
                    fontWeight: esFinal ? 700 : 600,
                  }}
                >
                  {String(clave).replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!esFinalizado && onAsignarBahia && (
        <label
          className="form__field"
          style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "10px", margin: 0 }}
        >
          <span style={{ fontSize: "0.75rem" }}>Bahía asignada</span>
          <select
            value={turno.id_bahia || turno.idBahia || ""}
            onChange={(e) => e.target.value && onAsignarBahia(turno.id, e.target.value)}
            id={`select-bahia-turno-${turno.id}`}
          >
            <option value="">Sin asignar</option>
            {bahias.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre || b.nombreBahia}
              </option>
            ))}
          </select>
        </label>
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
