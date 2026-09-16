import React, { useState, useEffect } from "react";
import { operariosApi } from "../../../api/operariosApi.js";

export function EditarOperarioModal({ isOpen, operario, onClose, onUpdated }) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (operario) {
      setNombres(operario.nombres || "");
      setApellidos(operario.apellidos || "");
      setDocumento(operario.documento || "");
      setTelefono(operario.telefono || "");
      setValidationError(null);
      setApiError(null);
    }
  }, [operario]);

  if (!isOpen || !operario) return null;

  function validate() {
    if (!nombres.trim()) return "El nombre es obligatorio.";
    if (!apellidos.trim()) return "Los apellidos son obligatorios.";
    if (!documento.trim()) return "El documento de identidad es obligatorio.";
    if (!telefono.trim()) return "El teléfono es obligatorio.";
    if (!/^[0-9]{7,10}$/.test(telefono.trim())) {
      return "El teléfono debe contener solo dígitos (entre 7 y 10).";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const valError = validate();
    if (valError) {
      setValidationError(valError);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        documento: documento.trim(),
        telefono: telefono.trim(),
      };

      await operariosApi.editar(operario.id, payload);
      onUpdated?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al actualizar los datos del operario.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-editar-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-editar-title">Editar Operario</h2>
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
              Modificando datos de <strong>@{operario.nombre_usuario}</strong> (ID #{operario.id}). El usuario y contraseña no pueden modificarse desde aquí.
            </p>
          </div>

          <div className="form__grid-2">
            <label className="form__field">
              <span>Nombres *</span>
              <input
                type="text"
                required
                maxLength={100}
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                disabled={isLoading}
                id="input-edit-nombres"
              />
            </label>

            <label className="form__field">
              <span>Apellidos *</span>
              <input
                type="text"
                required
                maxLength={100}
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                disabled={isLoading}
                id="input-edit-apellidos"
              />
            </label>
          </div>

          <div className="form__grid-2">
            <label className="form__field">
              <span>Documento de Identidad *</span>
              <input
                type="text"
                required
                maxLength={20}
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                disabled={isLoading}
                id="input-edit-documento"
              />
            </label>

            <label className="form__field">
              <span>Teléfono *</span>
              <input
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={isLoading}
                id="input-edit-telefono"
              />
            </label>
          </div>

          <div className="form__grid-2">
            <label className="form__field">
              <span>Nombre de Usuario (No editable)</span>
              <input
                type="text"
                value={operario.nombre_usuario || ""}
                disabled
                className="input--disabled"
                id="input-edit-usuario-disabled"
              />
            </label>

            <label className="form__field">
              <span>Estado actual</span>
              <input
                type="text"
                value={operario.estado || (operario.activo ? "Activo" : "Inactivo")}
                disabled
                className="input--disabled"
                id="input-edit-estado-disabled"
              />
            </label>
          </div>

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
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isLoading}
              id="btn-submit-edit-operario"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
