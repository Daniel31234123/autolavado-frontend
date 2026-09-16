import React, { useState } from "react";
import { turnosApi } from "../../../api/turnosApi.js";

const initialForm = {
  placa: "",
  tipo_vehiculo: "AUTO",
  telefono_cliente: "",
  id_servicio: "",
  id_operario: "",
  id_bahia: "",
};

const TIPOS_VEHICULO = [
  { value: "AUTO", label: "Automóvil / Sedán" },
  { value: "CAMIONETA", label: "Camioneta / SUV" },
  { value: "MOTO", label: "Motocicleta" },
];

export function CrearTurnoForm({
  servicios = [],
  operarios = [],
  bahias = [],
  onCreated,
}) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const placaLimpia = form.placa.trim().replace(/\s+/g, "").toUpperCase();

    if (!placaLimpia) {
      return "La placa es obligatoria.";
    }

    if (!/^[A-Z0-9]{5,6}$/.test(placaLimpia)) {
      return "La placa debe ser alfanumérica sin espacios (5 o 6 caracteres, ej: ABC123).";
    }

    if (!form.tipo_vehiculo) {
      return "Debes seleccionar el tipo de vehículo.";
    }

    if (!form.id_servicio) {
      return "Debes seleccionar un tipo de servicio.";
    }

    if (!form.id_operario) {
      return "Debes seleccionar un operario asignado.";
    }

    if (!form.id_bahia) {
      return "Debes seleccionar una bahía libre.";
    }

    if (!form.telefono_cliente.trim()) {
      return "El teléfono del cliente es obligatorio (10 dígitos).";
    }

    if (!/^[0-9]{10}$/.test(form.telefono_cliente.trim())) {
      return "El teléfono debe contener exactamente 10 dígitos numéricos.";
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

    const placaFinal = form.placa.trim().replace(/\s+/g, "").toUpperCase();

    const payload = {
      placa: placaFinal,
      tipo_vehiculo: form.tipo_vehiculo,
      telefono_cliente: form.telefono_cliente.trim(),
      id_servicio: Number(form.id_servicio),
      id_operario: Number(form.id_operario),
      id_bahia: Number(form.id_bahia),
    };

    // Metadata para el comprobante
    const servicioObj = servicios.find((s) => Number(s.id) === Number(form.id_servicio));
    const operarioObj = operarios.find((o) => Number(o.id) === Number(form.id_operario));
    const bahiaObj = bahias.find((b) => Number(b.id) === Number(form.id_bahia));

    const metadataForm = {
      placa: placaFinal,
      tipo_vehiculo: form.tipo_vehiculo,
      telefono_cliente: form.telefono_cliente.trim(),
      nombreServicio: servicioObj ? servicioObj.nombre : `Servicio #${form.id_servicio}`,
      nombreOperario: operarioObj ? `${operarioObj.nombres} ${operarioObj.apellidos}` : `Operario #${form.id_operario}`,
      nombreBahia: bahiaObj ? (bahiaObj.numero ? `Bahía ${bahiaObj.numero}` : `Bahía #${bahiaObj.id}`) : `Bahía #${form.id_bahia}`,
    };

    try {
      const response = await turnosApi.crear(payload);
      setForm(initialForm);
      onCreated?.(response, metadataForm);
    } catch (err) {
      // Muestra el error del backend sin perder los datos del formulario (RFF-004)
      setApiError(err.message || "Error al registrar el turno en el servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="form form--card" onSubmit={handleSubmit} id="form-crear-turno">
      <div className="form__card-header">
        <h2>Registrar Vehículo / Turno</h2>
        <p>Ingresa los datos del cliente para asignarle un turno consecutivo.</p>
      </div>

      {validationError && (
        <div className="alert alert--danger" role="alert" id="error-validacion-turno">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {apiError && (
        <div className="alert alert--danger" role="alert" id="error-backend-turno">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <div className="form__grid-2">
        <label className="form__field">
          <span>Placa del Vehículo *</span>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="Ej. ABC123"
            value={form.placa}
            onChange={(e) => updateField("placa", e.target.value.toUpperCase())}
            disabled={isLoading}
            id="input-placa"
            className="font-mono input--placa"
          />
          <small className="field__hint">6 caracteres alfanuméricos</small>
        </label>

        <label className="form__field">
          <span>Tipo de Vehículo *</span>
          <select
            required
            value={form.tipo_vehiculo}
            onChange={(e) => updateField("tipo_vehiculo", e.target.value)}
            disabled={isLoading}
            id="select-tipo-vehiculo"
          >
            {TIPOS_VEHICULO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form__field">
        <span>Teléfono del Cliente *</span>
        <input
          type="tel"
          required
          maxLength={10}
          inputMode="numeric"
          placeholder="Ej. 3001234567"
          value={form.telefono_cliente}
          onChange={(e) => updateField("telefono_cliente", e.target.value)}
          disabled={isLoading}
          id="input-telefono-cliente"
        />
        <small className="field__hint">10 dígitos para notificaciones de turno</small>
      </label>

      <label className="form__field">
        <span>Tipo de Servicio *</span>
        <select
          required
          value={form.id_servicio}
          onChange={(e) => updateField("id_servicio", e.target.value)}
          disabled={isLoading}
          id="select-servicio"
        >
          <option value="" disabled>
            — Seleccionar servicio del catálogo —
          </option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} {s.precio ? `($${Number(s.precio).toLocaleString("es-CO")})` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="form__grid-2">
        <label className="form__field">
          <span>Operario Asignado *</span>
          <select
            required
            value={form.id_operario}
            onChange={(e) => updateField("id_operario", e.target.value)}
            disabled={isLoading}
            id="select-operario"
          >
            <option value="" disabled>
              — Seleccionar operario —
            </option>
            {operarios.map((o) => {
              const isOcupado = String(o.estado).toUpperCase() === "OCUPADO";
              return (
                <option key={o.id} value={o.id} disabled={isOcupado}>
                  {o.nombres} {o.apellidos} {isOcupado ? "(Ocupado)" : "(Disponible)"}
                </option>
              );
            })}
          </select>
        </label>

        <label className="form__field">
          <span>Bahía Asignada *</span>
          <select
            required
            value={form.id_bahia}
            onChange={(e) => updateField("id_bahia", e.target.value)}
            disabled={isLoading}
            id="select-bahia"
          >
            <option value="" disabled>
              — Seleccionar bahía libre —
            </option>
            {bahias.map((b) => (
              <option key={b.id} value={b.id}>
                {b.numero ? `Bahía ${b.numero}` : `Bahía #${b.id}`} {b.tipo ? `(${b.tipo})` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--full btn--lg"
        disabled={isLoading}
        id="btn-generar-turno"
      >
        {isLoading ? (
          <span>Generando turno...</span>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>Generar Turno de Ingreso</span>
          </>
        )}
      </button>
    </form>
  );
}
