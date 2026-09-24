import React, { useState, useEffect } from "react";
import { turnosApi } from "../../../api/turnosApi.js";
import { vehiculosApi } from "../../../api/vehiculosApi.js";

const initialForm = {
  placa: "",
  tipo_vehiculo: "AUTO",
  telefono_cliente: "",
  id_servicio: "",
};

const TIPOS_VEHICULO = [
  { value: "AUTO", label: "Automóvil / Sedán" },
  { value: "CAMIONETA", label: "Camioneta / SUV" },
  { value: "MOTO", label: "Motocicleta" },
];

export function CrearTurnoForm({ servicios = [], onCreated, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [sugerenciasPlaca, setSugerenciasPlaca] = useState([]);
  const [vehiculoExistente, setVehiculoExistente] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vehiculosRegistrados, setVehiculosRegistrados] = useState([]);

  // Lista de placas ya registradas para autocompletar el ingreso (RF-01, RN-03)
  useEffect(() => {
    let activo = true;
    vehiculosApi
      .obtenerTodos()
      .then((data) => {
        if (activo) setVehiculosRegistrados(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Al elegir una placa de la lista se completan tipo de vehículo y teléfono
  const seleccionarVehiculoRegistrado = (placaSeleccionada) => {
    setValidationError(null);
    setApiError(null);

    const vehiculo = vehiculosRegistrados.find((v) => v.placa === placaSeleccionada);
    if (!vehiculo) {
      setForm((prev) => ({ ...prev, placa: "" }));
      setVehiculoExistente(false);
      return;
    }

    setForm((prev) => ({
      ...prev,
      placa: vehiculo.placa,
      tipo_vehiculo: vehiculo.tipo_vehiculo || vehiculo.tipoVehiculo || "AUTO",
      telefono_cliente: vehiculo.telefono_cliente || vehiculo.telefonoCliente || "",
    }));
    setVehiculoExistente(true);
    setSugerenciasPlaca([]);
  };

  // RF-01: Autocompletado reactivo de placa
  const handlePlacaChange = async (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    updateField("placa", val);
    setValidationError(null);
    setApiError(null);

    if (val.length >= 3) {
      try {
        const sugerencias = await vehiculosApi.buscar(val);
        setSugerenciasPlaca(sugerencias || []);

        const exacto = sugerencias?.find((s) => s.placa.toUpperCase() === val);
        if (exacto) {
          applyVehiculo(exacto);
        } else if (val.length === 6) {
          // RF-01: consulta directa del vehículo por placa completa
          try {
            applyVehiculo(await vehiculosApi.obtenerPorPlaca(val));
          } catch {
            setVehiculoExistente(false);
          }
        } else {
          setVehiculoExistente(false);
        }
      } catch {
        setSugerenciasPlaca([]);
      }
    } else {
      setSugerenciasPlaca([]);
      setVehiculoExistente(false);
    }
  };

  function applyVehiculo(vehiculo) {
    if (!vehiculo || !vehiculo.placa) {
      setVehiculoExistente(false);
      return;
    }
    updateField("tipo_vehiculo", vehiculo.tipo_vehiculo || vehiculo.tipoVehiculo || "AUTO");
    updateField("telefono_cliente", vehiculo.telefono_cliente || vehiculo.telefonoCliente || "");
    setVehiculoExistente(true);
  }

  const seleccionarSugerencia = (sug) => {
    setForm((prev) => ({
      ...prev,
      placa: sug.placa,
      tipo_vehiculo: sug.tipo_vehiculo || sug.tipoVehiculo || "AUTO",
      telefono_cliente: sug.telefono_cliente || sug.telefonoCliente || "",
    }));
    setVehiculoExistente(true);
    setSugerenciasPlaca([]);
  };

  function validate() {
    const placaLimpia = form.placa.trim().replace(/\s+/g, "").toUpperCase();

    if (!placaLimpia) {
      return "La placa es obligatoria.";
    }

    if (!/^[A-Z0-9]{5,6}$/.test(placaLimpia)) {
      return "La placa debe ser alfanumérica sin espacios (5 o 6 caracteres, ej: ABC123).";
    }

    if (!form.id_servicio) {
      return "Debes seleccionar un tipo de servicio.";
    }

    if (!vehiculoExistente) {
      if (!form.tipo_vehiculo) {
        return "Debes seleccionar el tipo de vehículo.";
      }
      if (!form.telefono_cliente.trim()) {
        return "El teléfono del cliente es obligatorio (10 dígitos).";
      }
      if (!/^[0-9]{10}$/.test(form.telefono_cliente.trim())) {
        return "El teléfono debe contener exactamente 10 dígitos numéricos.";
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

    const placaFinal = form.placa.trim().replace(/\s+/g, "").toUpperCase();

    const payload = {
      placa: placaFinal,
      tipo_vehiculo: form.tipo_vehiculo,
      telefono_cliente: form.telefono_cliente.trim() || undefined,
      id_servicio: Number(form.id_servicio),
    };

    const servicioObj = servicios.find((s) => Number(s.id) === Number(form.id_servicio));

    try {
      const resultado = await turnosApi.crear(payload);

      // Limpiar formulario tras éxito
      setForm(initialForm);
      setVehiculoExistente(false);
      setSugerenciasPlaca([]);

      if (onCreated) {
        onCreated(resultado, {
          ...payload,
          nombreServicio: servicioObj?.nombre || "Servicio",
          tarifaBase: servicioObj?.precioBase ?? servicioObj?.precio_base ?? 0,
        });
      }
    } catch (err) {
      setApiError(err.message || "Error al registrar el turno.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit} noValidate id="form-crear-turno">
      <header className="form-panel__header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div>
            <h2>Registrar Ingreso de Vehículo</h2>
            <p>Genera un turno con asignación automática de operario (RF-01, RF-02).</p>
          </div>
          {onClose && (
            <button
              type="button"
              className="modal__close-btn"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Cerrar"
            >
              &times;
            </button>
          )}
        </div>
      </header>

      {validationError && (
        <div className="alert alert--danger" role="alert" style={{ marginBottom: "16px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {apiError && (
        <div className="alert alert--danger" role="alert" style={{ marginBottom: "16px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="select-vehiculo-registrado" className="form-label">
          Vehículo registrado
        </label>
        <select
          id="select-vehiculo-registrado"
          className="form-select"
          value={form.placa}
          onChange={(e) => seleccionarVehiculoRegistrado(e.target.value)}
          disabled={isLoading}
        >
          <option value="">-- Seleccionar de la lista ({vehiculosRegistrados.length}) --</option>
          {vehiculosRegistrados.map((v) => (
            <option key={v.placa} value={v.placa}>
              {v.placa} · {v.tipo_vehiculo || v.tipoVehiculo} · {v.telefono_cliente || v.telefonoCliente}
            </option>
          ))}
        </select>
        <span style={{ fontSize: "0.72rem", color: "#667582" }}>
          Al elegir una placa se completan automáticamente el tipo de vehículo y el teléfono.
        </span>
      </div>

      <div className="form-group" style={{ position: "relative" }}>
        <label htmlFor="input-placa" className="form-label">
          Placa del Vehículo *
        </label>
        <input
          id="input-placa"
          type="text"
          className="form-input font-mono"
          placeholder="Ej: ABC123"
          maxLength={6}
          value={form.placa}
          onChange={handlePlacaChange}
          disabled={isLoading}
          autoComplete="off"
          required
        />
        {vehiculoExistente && (
          <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, marginTop: "4px", display: "block" }}>
            Vehículo registrado previamente (datos autocompletados)
          </span>
        )}

        {/* Menú de sugerencias para autocompletado */}
        {sugerenciasPlaca.length > 0 && !vehiculoExistente && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 20,
              background: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              maxHeight: "160px",
              overflowY: "auto",
            }}
          >
            {sugerenciasPlaca.map((sug) => (
              <button
                key={sug.placa}
                type="button"
                onClick={() => seleccionarSugerencia(sug)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  borderBottom: "1px solid #f1f5f9",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                <strong className="font-mono">{sug.placa}</strong>
                <span style={{ color: "#64748b", marginLeft: "8px" }}>
                  ({sug.tipo_vehiculo || sug.tipoVehiculo || "Auto"}) -{" "}
                  {sug.telefono_cliente || sug.telefonoCliente}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="select-tipo-vehiculo" className="form-label">
          Tipo de Vehículo *
        </label>
        <select
          id="select-tipo-vehiculo"
          className="form-select"
          value={form.tipo_vehiculo}
          onChange={(e) => updateField("tipo_vehiculo", e.target.value)}
          disabled={isLoading}
          required
        >
          {TIPOS_VEHICULO.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="input-telefono" className="form-label">
          Teléfono de Contacto {!vehiculoExistente && "*"}
        </label>
        <input
          id="input-telefono"
          type="tel"
          className="form-input font-mono"
          placeholder="Ej: 3001234567"
          maxLength={10}
          value={form.telefono_cliente}
          onChange={(e) => updateField("telefono_cliente", e.target.value.replace(/[^0-9]/g, ""))}
          disabled={isLoading}
          required={!vehiculoExistente}
        />
      </div>

      <div className="form-group">
        <label htmlFor="select-servicio" className="form-label">
          Servicio a Realizar *
        </label>
        <select
          id="select-servicio"
          className="form-select"
          value={form.id_servicio}
          onChange={(e) => updateField("id_servicio", e.target.value)}
          disabled={isLoading}
          required
        >
          <option value="">-- Seleccione un servicio --</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {String(s.nombre).replace(/_/g, " ")} — $
              {Number(s.precioBase ?? s.precio_base ?? 0).toLocaleString("es-CO")} ·{" "}
              {s.tiempoEstimadoMin ?? s.tiempo_estimado_min ?? 0} min
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "10px 12px",
          fontSize: "0.8rem",
          color: "#166534",
          marginBottom: "16px",
        }}
      >
 <strong>Asignación automática (RF-02):</strong> el sistema asignará imparcialmente un operario libre o encolará el turno según orden de llegada.
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        {onClose && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            disabled={isLoading}
            style={{ flex: "0 0 auto", minHeight: "48px", padding: "10px 20px" }}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={`btn btn--primary${isLoading ? " btn--loading" : ""}`}
          disabled={isLoading}
          id="btn-crear-turno-submit"
          style={{ flex: 1, minHeight: "48px" }}
        >
          {isLoading ? "Generando Turno..." : "Registrar e Ingresar"}
        </button>
      </div>
    </form>
  );
}
