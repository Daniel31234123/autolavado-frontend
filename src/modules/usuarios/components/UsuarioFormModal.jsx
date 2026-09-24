import React, { useState, useEffect } from "react";
import { usuariosApi } from "../../../api/usuariosApi.js";

const initialForm = { nombre_usuario: "", contrasena: "", activo: true };

/**
 * Modal de creación/edición de cuentas de administrador.
 * Consume POST y PUT /api/v1/usuarios/administradores.
 */
export function UsuarioFormModal({ isOpen, usuario, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre_usuario: usuario.nombre_usuario || "",
        contrasena: "",
        activo: usuario.activo !== false,
      });
    } else {
      setForm(initialForm);
    }
    setValidationError(null);
    setApiError(null);
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(usuario);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    if (!form.nombre_usuario.trim() || form.nombre_usuario.trim().length < 3) {
      setValidationError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (!isEditing && form.contrasena.length < 6) {
      setValidationError("La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await usuariosApi.editar(usuario.id, {
          nombre_usuario: form.nombre_usuario.trim(),
          activo: form.activo,
        });
      } else {
        await usuariosApi.crear({
          nombre_usuario: form.nombre_usuario.trim(),
          contrasena: form.contrasena,
          activo: form.activo,
        });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al guardar la cuenta de administrador.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-usuario-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-usuario-title">
            {isEditing ? "Editar Administrador" : "Nuevo Administrador"}
          </h2>
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
            <span>Nombre de Usuario *</span>
            <input
              type="text"
              required
              maxLength={60}
              minLength={3}
              value={form.nombre_usuario}
              onChange={(e) => updateField("nombre_usuario", e.target.value)}
              disabled={isLoading}
              id="input-usuario-nombre"
            />
          </label>

          {!isEditing && (
            <label className="form__field">
              <span>Contraseña * (Mín. 6 caracteres)</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.contrasena}
                onChange={(e) => updateField("contrasena", e.target.value)}
                disabled={isLoading}
                id="input-usuario-password"
              />
            </label>
          )}

          <label className="form__checkbox">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => updateField("activo", e.target.checked)}
              disabled={isLoading}
            />
            <span>Cuenta activa</span>
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
            <button type="submit" className={`btn btn--primary${isLoading ? " btn--loading" : ""}`} disabled={isLoading} id="btn-submit-usuario">
              {isLoading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Administrador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
