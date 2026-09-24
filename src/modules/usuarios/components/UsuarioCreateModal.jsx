import React, { useState, useEffect } from "react";
import { usuariosApi } from "../../../api/usuariosApi.js";
import { operariosApi } from "../../../api/operariosApi.js";

const initialForm = {
  // Campos de operario
  nombres: "",
  apellidos: "",
  documento: "",
  telefono: "",
  // Campos comunes
  nombre_usuario: "",
  contrasena: "",
};

/**
 * Alta unificada de usuarios del sistema.
 * El rol determina qué endpoint se consume y qué ficha se crea:
 *  - OPERARIO      -> POST /api/v1/operarios (ficha + cuenta)
 *  - ADMINISTRADOR -> POST /api/v1/usuarios/administradores
 */
export function UsuarioCreateModal({ isOpen, onClose, onCreated }) {
  const [rol, setRol] = useState("OPERARIO");
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRol("OPERARIO");
      setForm(initialForm);
      setValidationError(null);
      setApiError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.nombre_usuario.trim() || form.nombre_usuario.trim().length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres.";
    }
    if (!form.contrasena || form.contrasena.length < 6) {
      return "La contraseña debe tener un mínimo de 6 caracteres.";
    }
    if (rol === "OPERARIO") {
      if (!form.nombres.trim()) return "El nombre es obligatorio.";
      if (!form.apellidos.trim()) return "Los apellidos son obligatorios.";
      if (!form.documento.trim()) return "El documento de identidad es obligatorio.";
      if (!form.telefono.trim()) return "El teléfono es obligatorio.";
      if (!/^[0-9]{7,10}$/.test(form.telefono.trim())) {
        return "El teléfono debe contener solo dígitos (entre 7 y 10).";
      }
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
      if (rol === "ADMINISTRADOR") {
        await usuariosApi.crear({
          nombre_usuario: form.nombre_usuario.trim(),
          contrasena: form.contrasena,
          activo: true,
        });
      } else {
        await operariosApi.crear({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          documento: form.documento.trim(),
          telefono: form.telefono.trim(),
          nombre_usuario: form.nombre_usuario.trim(),
          contrasena: form.contrasena,
        });
      }
      onCreated?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al crear el usuario.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-crear-usuario-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-crear-usuario-title">Nuevo Usuario</h2>
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
            <span>Rol del usuario *</span>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={isLoading}
              id="select-rol-usuario"
            >
              <option value="OPERARIO">Operario (ficha de trabajo)</option>
              <option value="ADMINISTRADOR">Administrador (acceso al panel)</option>
            </select>
          </label>

          {rol === "OPERARIO" && (
            <>
              <div className="form__grid-2">
                <label className="form__field">
                  <span>Nombres *</span>
                  <input
                    type="text"
                    required
                    maxLength={100}
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
                    value={form.telefono}
                    onChange={(e) => updateField("telefono", e.target.value.replace(/[^0-9]/g, ""))}
                    disabled={isLoading}
                    id="input-crear-telefono"
                  />
                </label>
              </div>
            </>
          )}

          <div className="form__divider" />

          <div className="form__grid-2">
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
                id="input-crear-usuario"
              />
            </label>

            <label className="form__field">
              <span>Contraseña * (Mín. 6 caracteres)</span>
              <input
                type="password"
                required
                minLength={6}
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
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className={`btn btn--primary${isLoading ? " btn--loading" : ""}`} disabled={isLoading} id="btn-submit-crear-usuario">
              {isLoading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
