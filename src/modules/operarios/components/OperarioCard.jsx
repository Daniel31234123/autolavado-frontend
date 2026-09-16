import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { getEstadoOperarioInfo } from "../constants/operarioEnums.js";

/**
 * @param {{ operario: import("../api/operariosService.js").Operario }} props
 */
export function OperarioCard({ operario }) {
  const estado = getEstadoOperarioInfo(operario.estado);

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
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
        {operario.estado && <StatusBadge label={estado.label} tone={estado.tone} />}
        <StatusBadge label={operario.activo ? "Activo" : "Inactivo"} tone={operario.activo ? "positive" : "neutral"} />
      </div>
    </article>
  );
}

