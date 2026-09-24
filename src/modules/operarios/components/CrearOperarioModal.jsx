import React, { useState } from "react";
import { operariosApi } from "../../../api/operariosApi.js";

const initialForm = {
  nombres: "",
  apellidos: "",
  documento: "",
  telefono: "",
  nombre_usuario: "",
  contrasena: "",
};

export function CrearOperarioModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.nombres.trim()) return "El nombre es obligatorio.";
    if (!form.apellidos.trim()) return "Los apellidos son obligatorios.";
    if (!form.documento.trim()) return "El documento de identidad es obligatorio.";
    if (!form.telefono.trim()) return "El teléfono es obligatorio.";
    if (!/^[0-9]{7,10}$/.test(form.telefono.trim())) {
      return "El teléfono debe contener solo dígitos (entre 7 y 10).";
    }
    if (!form.nombre_usuario.trim()) return "El nombre de usuario es obligatorio.";
    if (form.nombre_usuario.trim().length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres.";
    }
    if (!form.contrasena) return "La contraseña es obligatoria.";
    if (form.contrasena.length < 8) {
      return "La contraseña debe tener un mínimo de 8 caracteres.";
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
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        documento: form.documento.trim(),
        telefono: form.telefono.trim(),
        nombre_usuario: form.nombre_usuario.trim(),
        contrasena: form.contrasena,
      };

      await operariosApi.crear(payload);
      setForm(initialForm);
      onCreated?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al crear el operario.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-crear-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-crear-title">Registrar Nuevo Operario</h2>
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
          <div className="form__grid-2">
            <label className="form__field">
              <span>Nombres *</span>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Ej. Carlos Eduardo"
                value={form.nombres}
                onChange={(e) => updateField("nombres", e.target.value)}
                disabled={isLoading}
                id="input-crear-nombres"
              />
            </label>

            <label className="form__field">
              <span>Apellidos *</span>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Ej. Mendoza Paternina"
                value={form.apellidos}
                onChange={(e) => updateField("apellidos", e.target.value)}
                disabled={isLoading}
                id="input-crear-apellidos"
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
                placeholder="Ej. 1102837465"
                value={form.documento}
                onChange={(e) => updateField("documento", e.target.value)}
                disabled={isLoading}
                id="input-crear-documento"
              />
            </label>

            <label className="form__field">
              <span>Teléfono *</span>
              <input
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                placeholder="Ej. 3001234567"
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                disabled={isLoading}
                id="input-crear-telefono"
              />
            </label>
          </div>

          <div className="form__divider" />

          <div className="form__grid-2">
            <label className="form__field">
              <span>Nombre de Usuario *</span>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="Ej. cmendoza"
                value={form.nombre_usuario}
                onChange={(e) => updateField("nombre_usuario", e.target.value)}
                disabled={isLoading}
                id="input-crear-usuario"
              />
            </label>

            <label className="form__field">
              <span>Contraseña * (Mín. 8 caracteres)</span>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={form.contrasena}
                onChange={(e) => updateField("contrasena", e.target.value)}
                disabled={isLoading}
                id="input-crear-password"
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
              className={`btn btn--primary${isLoading ? " btn--loading" : ""}`}
              disabled={isLoading}
              id="btn-submit-crear-operario"
            >
              {isLoading ? "Creando..." : "Guardar Operario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
