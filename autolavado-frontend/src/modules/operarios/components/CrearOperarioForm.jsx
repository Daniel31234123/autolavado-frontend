import { useState } from "react";
import { useCrearOperario } from "../hooks/useCrearOperario.js";

const initialForm = { nombres: "", apellidos: "", documento: "", telefono: "", activo: true };

export function CrearOperarioForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);
  const { crearOperario, isLoading, isError, error } = useCrearOperario();

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError(null);

    if (form.telefono && !/^[0-9]{0,10}$/.test(form.telefono)) {
      setValidationError("El teléfono debe tener solo dígitos (máx. 10).");
      return;
    }

    try {
      await crearOperario(form);
      setForm(initialForm);
      onCreated?.();
    } catch {
      // el error ya queda expuesto vía isError/error
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Nuevo operario</h2>

      <div className="form__row">
        <label className="form__field">
          <span>Nombres</span>
          <input
            required
            maxLength={100}
            value={form.nombres}
            onChange={(e) => updateField("nombres", e.target.value)}
          />
        </label>
        <label className="form__field">
          <span>Apellidos</span>
          <input
            required
            maxLength={100}
            value={form.apellidos}
            onChange={(e) => updateField("apellidos", e.target.value)}
          />
        </label>
      </div>

      <div className="form__row">
        <label className="form__field">
          <span>Documento</span>
          <input
            required
            maxLength={20}
            value={form.documento}
            onChange={(e) => updateField("documento", e.target.value)}
          />
        </label>
        <label className="form__field">
          <span>Teléfono</span>
          <input
            required
            maxLength={10}
            inputMode="numeric"
            placeholder="Solo dígitos"
            value={form.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
          />
        </label>
      </div>

      <label className="form__checkbox">
        <input type="checkbox" checked={form.activo} onChange={(e) => updateField("activo", e.target.checked)} />
        <span>Activo desde ahora</span>
      </label>

      {validationError && <p className="form__error">{validationError}</p>}
      {isError && <p className="form__error">{error?.message}</p>}

      <button type="submit" className="btn btn--primary" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Registrar operario"}
      </button>
    </form>
  );
}
