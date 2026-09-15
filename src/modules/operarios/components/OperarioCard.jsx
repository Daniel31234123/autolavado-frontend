import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";

/**
 * @param {{ operario: import("../api/operariosService.js").Operario }} props
 */
export function OperarioCard({ operario }) {
  return (
    <article className="card operario-card">
      <div className="operario-card__avatar" aria-hidden="true">
        {operario.nombres?.[0]}
        {operario.apellidos?.[0]}
      </div>
      <div className="operario-card__body">
        <h3>
          {operario.nombres} {operario.apellidos}
        </h3>
        <p className="operario-card__meta">Doc. {operario.documento}</p>
        <p className="operario-card__meta">Tel. {operario.telefono}</p>
      </div>
      <StatusBadge label={operario.activo ? "Activo" : "Inactivo"} tone={operario.activo ? "positive" : "neutral"} />
    </article>
  );
}
