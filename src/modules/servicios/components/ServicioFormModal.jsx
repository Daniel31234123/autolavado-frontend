import React, { useState, useEffect } from "react";
import { serviciosService } from "../api/serviciosService.js";

const initialForm = {
  nombre: "",
  precio_base: "",
  tiempo_estimado_min: "",
  fases: "",
};

/**
 * Modal de creación/edición del catálogo de servicios.
 * Consume POST /api/v1/servicios y PUT /api/v1/servicios/{id}.
 */
export function ServicioFormModal({ isOpen, servicio, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (servicio) {
      setForm({
        nombre: servicio.nombre || "",
        precio_base: String(servicio.precio_base ?? servicio.precioBase ?? ""),
        tiempo_estimado_min: String(
          servicio.tiempo_estimado_min ?? servicio.tiempoEstimadoMin ?? ""
        ),
        fases: Array.isArray(servicio.fases) ? servicio.fases.join(", ") : "",
      });
    } else {
      setForm(initialForm);
    }
    setValidationError(null);
    setApiError(null);
  }, [servicio, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(servicio);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(fases) {
    if (!form.nombre.trim()) return "El nombre del servicio es obligatorio.";
    if (form.nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (form.precio_base === "" || Number(form.precio_base) < 0) {
      return "El precio base debe ser un valor mayor o igual a 0.";
    }
    if (!form.tiempo_estimado_min || Number(form.tiempo_estimado_min) < 1) {
      return "El tiempo estimado debe ser de al menos 1 minuto.";
    }
    if (fases.length < 2) return "Define al menos 2 fases del servicio.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const fases = form.fases
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const valError = validate(fases);
    if (valError) {
      setValidationError(valError);
      return;
    }

    const payload = {
      nombre: form.nombre.trim().toUpperCase().replace(/\s+/g, "_"),
      precio_base: Number(form.precio_base),
      tiempo_estimado_min: Number(form.tiempo_estimado_min),
      fases,
    };

    setIsLoading(true);
    try {
      if (isEditing) {
        await serviciosService.update(servicio.id, payload);
      } else {
        await serviciosService.create(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setApiError(err.message || "Error al guardar el servicio.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-servicio-title">
      <div className="modal modal--form">
        <div className="modal__header">
          <h2 id="modal-servicio-title">
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
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
            <span>Nombre del Servicio *</span>
            <input
              type="text"
              required
              maxLength={50}
              placeholder="Ej. LAVADO GENERAL"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              disabled={isLoading}
              id="input-servicio-nombre"
            />
          </label>

          <div className="form__grid-2">
            <label className="form__field">
              <span>Precio Base (COP) *</span>
              <input
                type="number"
                required
                min={0}
                step="1000"
                value={form.precio_base}
                onChange={(e) => updateField("precio_base", e.target.value)}
                disabled={isLoading}
                id="input-servicio-precio"
              />
            </label>

            <label className="form__field">
              <span>Tiempo Estimado (min) *</span>
              <input
                type="number"
                required
                min={1}
                value={form.tiempo_estimado_min}
                onChange={(e) => updateField("tiempo_estimado_min", e.target.value)}
                disabled={isLoading}
                id="input-servicio-tiempo"
              />
            </label>
          </div>

          <label className="form__field">
            <span>Fases del Servicio * (separadas por coma, mínimo 2)</span>
            <input
              type="text"
              required
              placeholder="Ej. POR_INICIAR, ENJABONADO, ENJUAGADO, SECADO, LISTO"
              value={form.fases}
              onChange={(e) => updateField("fases", e.target.value)}
              disabled={isLoading}
              id="input-servicio-fases"
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
            <button type="submit" className="btn btn--primary" disabled={isLoading} id="btn-submit-servicio">
              {isLoading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
