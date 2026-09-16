import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * @param {{ turno: import("../api/turnosService.js").TurnoCreadoResponse, onClose: () => void }} props
 */
export function TurnoCreadoModal({ turno, onClose }) {
  const [fallbackQr, setFallbackQr] = useState("");

  useEffect(() => {
    if (!turno || turno.qrUrl) return;
    QRCode.toDataURL(turno.hashConsulta || turno.numeroTurno, { margin: 1 })
      .then(setFallbackQr)
      .catch(() => setFallbackQr(""));
  }, [turno]);

  if (!turno) return null;

  const qrSource = fallbackQr || turno.qrUrl;

  function handleQrError() {
    QRCode.toDataURL(turno.hashConsulta || turno.numeroTurno, { margin: 1 })
      .then(setFallbackQr)
      .catch(() => setFallbackQr(""));
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>Turno creado</h2>
        <p className="modal__numero">{turno.numeroTurno}</p>

        {qrSource && (
          <img
            className="modal__qr"
            src={qrSource}
            alt={`Código QR de consulta del turno ${turno.numeroTurno}`}
            onError={handleQrError}
          />
        )}

        <p className="modal__hint">El cliente puede usar este código para consultar el estado de su turno.</p>

        <button type="button" className="btn btn--primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
