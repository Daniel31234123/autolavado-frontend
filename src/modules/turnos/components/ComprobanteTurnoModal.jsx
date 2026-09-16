import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Visualización del Comprobante y Número de Turno Consecutivo (RFF-005 / RF-002).
 * Muestra claramente el número devuelto por el backend (T-001, T-002, etc.),
 * los recursos asignados y el código QR de seguimiento.
 * Es visible sin scroll en escritorio y el número no es editable.
 */
export function ComprobanteTurnoModal({ turno, datosFormulario, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (!turno) return;

    // Si el backend entrega qr_url o hash_consulta, generamos el QR
    const qrData = turno.qr_url || turno.qrUrl || turno.hash_consulta || turno.hashConsulta || turno.numero_turno || turno.numeroTurno;
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
  const fechaIngresoRaw = turno.fecha_ingreso || turno.fechaIngreso;
  const fechaFormateada = fechaIngresoRaw
    ? new Date(fechaIngresoRaw).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

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
            <span className="ticket__status-pill">RECEPCIÓN</span>
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
                {datosFormulario?.nombreServicio || "Lavado"}
              </strong>
            </div>

            <div className="ticket__detail-item">
              <span className="detail__label">Bahía:</span>
              <strong className="detail__value">
                {datosFormulario?.nombreBahia || "Bahía asignada"}
              </strong>
            </div>

            <div className="ticket__detail-item">
              <span className="detail__label">Operario:</span>
              <strong className="detail__value">
                {datosFormulario?.nombreOperario || "Operario asignado"}
              </strong>
            </div>

            <div className="ticket__detail-item">
              <span className="detail__label">Hora ingreso:</span>
              <strong className="detail__value font-mono">{fechaFormateada}</strong>
            </div>
          </div>

          {/* Código QR de consulta para el cliente */}
          {qrCodeUrl && (
            <div className="ticket__qr-box">
              <img
                src={qrCodeUrl}
                alt={`Código QR para el turno ${numeroTurno}`}
                className="ticket__qr-img"
              />
              <p className="ticket__qr-hint">
                Escanea este código para consultar el estado en vivo de tu vehículo.
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="ticket__actions">
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={onClose}
              id="btn-cerrar-comprobante"
            >
              Registrar otro vehículo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
