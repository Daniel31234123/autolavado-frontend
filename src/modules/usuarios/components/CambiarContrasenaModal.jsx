import React, { useState, useEffect } from "react";
import { usuariosApi } from "../../../api/usuariosApi.js";

/**
 * Modal para cambiar la contraseña de un administrador.
 * Consume PATCH /api/v1/usuarios/administradores/{id}/contrasena.
 */
export function CambiarContrasenaModal({ isOpen, usuario, onClose, onSaved }) {
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContrasena("");
    setConfirmacion("");
    setValidationError(null);
    setApiError(null);
  }, [usuario, isOpen]);

  if (!isOpen || !usuario) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    if (contrasena.length < 6) {
      setValidationError("La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }
    if (contrasena !== confirmacion) {
      setValidationError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await usuariosApi.cambiarContrasena(usuario.id, contrasena);
      onSaved?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al cambiar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-pass-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-pass-title">Cambiar Contraseña</h2>
          <button
            type="button"
            className="modal__close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="form__notice">
            <p>
              Nueva contraseña para <strong>@{usuario.nombre_usuario}</strong> (ID #{usuario.id}).
            </p>
          </div>

          <label className="form__field">
            <span>Nueva Contraseña *</span>
            <input
              type="password"
              required
              minLength={6}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={isLoading}
              id="input-nueva-password"
            />
          </label>

          <label className="form__field">
            <span>Confirmar Contraseña *</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              disabled={isLoading}
              id="input-confirmar-password"
            />
          </label>

          {validationError && (
            <div className="alert alert--danger" role="alert">
              <span>{validationError}</span>
            </div>
          )}

          {apiError && (
            <div className="alert alert--danger" role="alert">
              <span>{apiError}</span>
            </div>
          )}

          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading} id="btn-submit-password">
              {isLoading ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
