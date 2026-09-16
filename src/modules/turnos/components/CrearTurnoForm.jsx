import { useState } from "react";
import { useCrearTurno } from "../hooks/useCrearTurno.js";
import { TIPO_VEHICULO_OPTIONS } from "../constants/turnoEnums.js";

const initialForm = {
  placa: "",
  tipoVehiculo: "",
  telefonoCliente: "",
  idServicio: "",
  idOperario: "",
  idBahia: "",
};

/**
 * El formulario de Turnos necesita elegir servicio/operario/bahía, que son
 * datos de OTROS módulos. En vez de que este módulo importe los servicios
 * de Servicios/Operarios/Bahías directamente (rompiendo el aislamiento),
 * la página compositora (TurnosPage) le pasa esas listas ya cargadas.
 *
 * @param {{
 *   servicios: import("../../servicios/api/serviciosService.js").Servicio[],
 *   operarios: import("../../operarios/api/operariosService.js").Operario[],
 *   bahias: import("../../bahias/api/bahiasService.js").Bahia[],
 *   onCreated: (resultado: import("../api/turnosService.js").TurnoCreadoResponse) => void,
 * }} props
 */
export function CrearTurnoForm({ servicios = [], operarios = [], bahias = [], onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const { crearTurno, isLoading, isError, error } = useCrearTurno();

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (form.placa.length !== 6) return "La placa debe tener exactamente 6 caracteres.";
    if (!form.tipoVehiculo) return "Selecciona el tipo de vehículo.";
    if (!/^[0-9]{10}$/.test(form.telefonoCliente)) return "El teléfono del cliente debe tener exactamente 10 dígitos.";
    if (!form.idServicio) return "Selecciona un servicio.";
    if (!form.idOperario) return "Selecciona un operario.";
    if (!form.idBahia) return "Selecciona una bahía.";
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validate();
    setValidationError(validation);
    if (validation) return;

    const payload = {
      placa: form.placa.toUpperCase(),
      tipo_vehiculo: form.tipoVehiculo,
      telefono_cliente: form.telefonoCliente,
      id_servicio: form.idServicio,
      id_operario: form.idOperario,
      id_bahia: form.idBahia,
    };

    try {
      const resultado = await crearTurno(payload);
      setForm(initialForm);
      onCreated?.(resultado);
    } catch {
      // el error ya queda expuesto vía isError/error
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Nuevo turno</h2>

      <div className="form__row">
        <label className="form__field">
          <span>Placa</span>
          <input
            required
            minLength={6}
            maxLength={6}
            placeholder="ABC123"
            value={form.placa}
            onChange={(e) => updateField("placa", e.target.value.toUpperCase())}
          />
        </label>
        <label className="form__field">
          <span>Tipo de vehículo</span>
          <select required value={form.tipoVehiculo} onChange={(e) => updateField("tipoVehiculo", e.target.value)}>
            <option value="" disabled>
              Selecciona un tipo
            </option>
            {TIPO_VEHICULO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form__field">
        <span>Teléfono del cliente</span>
        <input
          required
          maxLength={10}
          inputMode="numeric"
          placeholder="10 dígitos"
          value={form.telefonoCliente}
          onChange={(e) => updateField("telefonoCliente", e.target.value)}
        />
      </label>

      <label className="form__field">
        <span>Servicio</span>
        <select required value={form.idServicio} onChange={(e) => updateField("idServicio", e.target.value)}>
          <option value="" disabled>
            Selecciona un servicio
          </option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="form__row">
        <label className="form__field">
          <span>Operario</span>
          <select required value={form.idOperario} onChange={(e) => updateField("idOperario", e.target.value)}>
            <option value="" disabled>
              Selecciona un operario
            </option>
            {operarios.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombres} {o.apellidos}
              </option>
            ))}
          </select>
        </label>
        <label className="form__field">
          <span>Bahía</span>
          <select required value={form.idBahia} onChange={(e) => updateField("idBahia", e.target.value)}>
            <option value="" disabled>
              Selecciona una bahía
            </option>
            {bahias.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombreBahia}
              </option>
            ))}
          </select>
        </label>
      </div>

      {validationError && <p className="form__error">{validationError}</p>}
      {isError && <p className="form__error">{error?.message}</p>}

      <button type="submit" className="btn btn--primary" disabled={isLoading}>
        {isLoading ? "Creando..." : "Crear turno"}
      </button>
    </form>
  );
}
