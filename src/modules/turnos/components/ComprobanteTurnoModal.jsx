import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Visualización del Comprobante y Número de Turno Consecutivo (RF-01, RF-02).
 * Muestra el número devuelto por el backend (ej: T-001, T-002),
 * los datos del vehículo, servicio y el código QR de seguimiento en tiempo real.
 */
export function ComprobanteTurnoModal({ turno, datosFormulario, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (!turno) return;

    // Si el backend entrega qr_url o hash_consulta, generamos el QR
    const qrData =
      turno.qr_url ||
      turno.qrUrl ||
      turno.hash_consulta ||
      turno.hashConsulta ||
      turno.numero_turno ||
      turno.numeroTurno;

    if (qrData) {
      QRCode.toDataURL(qrData, {
        width: 160,
        margin: 1,
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      })
        .then(setQrCodeUrl)
        .catch(() => setQrCodeUrl(""));
    }
  }, [turno]);

  if (!turno) return null;

  const numeroTurno = turno.numero_turno || turno.numeroTurno || "T-000";
  const estado = turno.estado || turno.estado_actual || turno.estadoActual || "EN_COLA";
  const fechaIngresoRaw = turno.fecha_ingreso || turno.fechaIngreso;
  const fechaFormateada = fechaIngresoRaw
    ? new Date(fechaIngresoRaw).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const trackingHash = turno.hash_consulta || turno.hashConsulta || turno.placa;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="comprobante-title">
      <div className="modal modal--comprobante">
        <div className="comprobante-ticket">
          {/* Header del comprobante */}
          <div className="ticket__header">
            <div className="ticket__brand-mark">AE</div>
            <h3 id="comprobante-title">AutoLavado Express</h3>
            <p className="ticket__subtitle">Comprobante de Ingreso y Turno</p>
          </div>

          {/* Número consecutivo destacado */}
          <div className="ticket__number-box">
            <span className="ticket__number-label">NÚMERO DE TURNO</span>
            <div className="ticket__number-display" id="turno-numero-consecutivo">
              {numeroTurno}
            </div>
            <span className="ticket__status-pill">{estado}</span>
          </div>

          {/* Resumen de recursos y vehículo */}
          <div className="ticket__details-grid">
            <div className="ticket__detail-item">
              <span className="detail__label">Placa:</span>
              <strong className="detail__value font-mono">
                {turno.placa || datosFormulario?.placa || "—"}
              </strong>
            </div>

            <div className="ticket__detail-item">
              <span className="detail__label">Vehículo:</span>
              <strong className="detail__value">
                {turno.tipo_vehiculo || turno.tipoVehiculo || datosFormulario?.tipo_vehiculo || "AUTO"}
              </strong>
            </div>

            <div className="ticket__detail-item">
              <span className="detail__label">Servicio:</span>
              <strong className="detail__value">
                {datosFormulario?.nombreServicio || "Lavado General"}
              </strong>
            </div>

            <div className="ticket__detail-item">
              <span className="detail__label">Hora Ingreso:</span>
              <strong className="detail__value font-mono">{fechaFormateada}</strong>
            </div>
          </div>

          {/* QR de seguimiento para el cliente */}
          <div className="ticket__qr-box">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Código QR para seguimiento de turno en vivo"
                className="ticket__qr-image"
                id="qr-seguimiento-turno"
              />
            ) : (
              <div className="ticket__qr-placeholder">Cargando QR...</div>
            )}
            <p className="ticket__qr-hint">Escanea para monitorear el avance de tu lavado en tiempo real.</p>
          </div>

          {/* Botones de acción */}
          <div className="ticket__actions">
            {trackingHash && (
              <a
                href={`/track/${trackingHash}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--sm btn--primary"
                style={{ textDecoration: "none", textAlign: "center", display: "grid", placeItems: "center" }}
              >
                Abrir seguimiento en vivo
              </a>
            )}
            <button
              type="button"
              className="btn btn--sm btn--outline"
              onClick={onClose}
              id="btn-cerrar-comprobante"
              style={{ minHeight: "44px" }}
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
