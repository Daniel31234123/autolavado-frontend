import React from "react";

/**
 * Diálogo de confirmación accesible para acciones destructivas (RFF-009 / RNFF-002).
 */
export function ConfirmModal({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro de continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="modal modal--confirm">
        <div className="modal__icon-wrapper modal__icon-wrapper--danger">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h3 id="confirm-modal-title" className="modal__title">
          {title}
        </h3>
        <p className="modal__message">{message}</p>

        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isLoading}
            id="btn-confirm-cancel"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn--danger" : "btn--primary"}${isLoading ? " btn--loading" : ""}`}
            onClick={onConfirm}
            disabled={isLoading}
            id="btn-confirm-accept"
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
