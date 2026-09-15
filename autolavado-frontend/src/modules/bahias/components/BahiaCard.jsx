import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { getEstadoBahiaInfo, getTipoBahiaLabel } from "../constants/bahiaEnums.js";

/**
 * @param {{ bahia: import("../api/bahiasService.js").Bahia }} props
 */
export function BahiaCard({ bahia }) {
  const estado = getEstadoBahiaInfo(bahia.estado);
  return (
    <article className="card bahia-card">
      <header className="bahia-card__header">
        <h3>{bahia.nombreBahia}</h3>
        <StatusBadge label={estado.label} tone={estado.tone} />
      </header>
      <p className="bahia-card__tipo">{getTipoBahiaLabel(bahia.tipo)}</p>
    </article>
  );
}
