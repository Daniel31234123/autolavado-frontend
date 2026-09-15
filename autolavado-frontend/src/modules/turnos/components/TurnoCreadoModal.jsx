/**
 * @param {{ turno: import("../api/turnosService.js").TurnoCreadoResponse, onClose: () => void }} props
 */
export function TurnoCreadoModal({ turno, onClose }) {
  if (!turno) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>Turno creado</h2>
        <p className="modal__numero">{turno.numeroTurno}</p>

        {turno.qrUrl && (
          <img className="modal__qr" src={turno.qrUrl} alt={`Código QR de consulta del turno ${turno.numeroTurno}`} />
        )}

        <p className="modal__hint">El cliente puede usar este código para consultar el estado de su turno.</p>

        <button type="button" className="btn btn--primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
