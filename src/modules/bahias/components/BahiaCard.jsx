import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { getEstadoBahiaInfo } from "../constants/bahiaEnums.js";

/**
 * Tarjeta de bahía: solo muestra el nombre y el estado actual (solo lectura).
 * @param {{ bahia: any }} props
 */
export function BahiaCard({ bahia }) {
  const estadoInfo = getEstadoBahiaInfo(bahia.estado);
  const nombre = bahia.nombre || bahia.nombreBahia || `Bahía #${bahia.id}`;

  return (
    <article className="card bahia-card">
      <header className="bahia-card__header">
        <h3>{nombre}</h3>
        <StatusBadge label={estadoInfo.label} tone={estadoInfo.tone} />
      </header>
    </article>
  );
}
