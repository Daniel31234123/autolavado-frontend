import React, { useState, useEffect } from "react";
import { bahiasService } from "../api/bahiasService.js";

/**
 * Modal de creación/edición de bahías.
 * Consume POST /api/v1/bahias y PUT /api/v1/bahias/{id}.
 */
export function BahiaFormModal({ isOpen, bahia, onClose, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNombre(bahia ? bahia.nombre || bahia.nombreBahia || "" : "");
    setValidationError(null);
    setApiError(null);
  }, [bahia, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(bahia);

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    if (!nombre.trim()) {
      setValidationError("El nombre de la bahía es obligatorio.");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await bahiasService.update(bahia.id, { nombre: nombre.trim() });
      } else {
        await bahiasService.create({ nombre: nombre.trim() });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al guardar la bahía.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-bahia-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-bahia-title">{isEditing ? "Editar Bahía" : "Nueva Bahía"}</h2>
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
          <label className="form__field">
            <span>Nombre de la Bahía *</span>
            <input
              type="text"
              required
              maxLength={50}
              placeholder="Ej. Bahía 1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isLoading}
              id="input-bahia-nombre"
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
            <button type="submit" className="btn btn--primary" disabled={isLoading} id="btn-submit-bahia">
              {isLoading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Bahía"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
