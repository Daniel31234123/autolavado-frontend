import React, { useState } from "react";
import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";

const FASES_FALLBACK = ["POR_INICIAR", "ENJABONADO", "ENJUAGADO", "SECADO", "LISTO"];

export function TurnoCard({
  turno,
  onFinalizar,
  onCancelar,
  onActualizarFase,
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
  const idBahia = turno.id_bahia ?? turno.idBahia ?? null;
  const tieneBahia = idBahia !== null && idBahia !== undefined && idBahia !== "";
  const nombreOperario =
    turno.nombre_operario || turno.nombreOperario || "Por asignar";
  const nombreBahia = turno.nombre_bahia || turno.nombreBahia || "Sin bahía";

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
  const indiceActual = fases.findIndex((f) => String(f).toUpperCase() === estadoUpper);
  // EN_COLA y EN_PATIO son estados de ubicación: se muestran pero no son clicables.
  const esFaseUbicacion = (clave) => clave === "EN_COLA" || clave === "EN_PATIO";

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
          <dt>Operario</dt>
          <dd>{nombreOperario}</dd>
        </div>
        <div>
          <dt>Bahía</dt>
          <dd>{nombreBahia}</dd>
        </div>
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

      {/* Controles de Fases (solo con bahía asignada; en cola se asigna automáticamente) */}
      {!esFinalizado && tieneBahia && onActualizarFase && (
        <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "10px", marginTop: "4px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
            FASES DE LAVADO (TIEMPO REAL):
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {fases.map((fase, idx) => {
              const clave = String(fase).toUpperCase();
              const esActiva = indiceActual === idx;
              const completada = indiceActual > idx;
              const esUbicacion = esFaseUbicacion(clave);
              const esFinal = clave === "LISTO" || clave === "LISTO_PARA_RECOGER";
              const deshabilitado = loadingFase || esActiva || completada || esUbicacion;

              return (
                <button
                  key={clave}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => cambiarFase(clave)}
                  title={esUbicacion || completada ? undefined : `Avanzar a ${clave.replace(/_/g, " ")}`}
                  style={{
                    fontSize: "0.75rem",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: `1px solid ${
                      esActiva ? (esFinal ? "#22c55e" : "var(--color-primary)") : completada ? "#86efac" : "#cbd5e1"
                    }`,
                    background: esActiva
                      ? esFinal
                        ? "#22c55e"
                        : "var(--color-primary)"
                      : completada
                      ? "#dcfce7"
                      : "#fff",
                    color: esActiva ? "#fff" : completada ? "#15803d" : esUbicacion ? "#94a3b8" : "var(--color-ink)",
                    cursor: deshabilitado ? "not-allowed" : "pointer",
                    fontWeight: esActiva || esFinal ? 700 : 600,
                  }}
                >
                  {clave.replace(/_/g, " ")}
                </button>
              );
            })}
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
