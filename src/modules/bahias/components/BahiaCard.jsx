import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { getEstadoBahiaInfo } from "../constants/bahiaEnums.js";

export const ESTADOS_BAHIA = ["DISPONIBLE", "OCUPADA", "MANTENIMIENTO"];

/**
 * @param {{ bahia: any, onEdit?: (bahia: any) => void, onChangeEstado?: (bahia: any, estado: string) => void, isUpdating?: boolean }} props
 */
export function BahiaCard({ bahia, onEdit, onChangeEstado, isUpdating = false }) {
  const estadoInfo = getEstadoBahiaInfo(bahia.estado);
  const nombre = bahia.nombre || bahia.nombreBahia || `Bahía #${bahia.id}`;

  return (
    <article className="card bahia-card">
      <header className="bahia-card__header">
        <h3>{nombre}</h3>
        <StatusBadge label={estadoInfo.label} tone={estadoInfo.tone} />
      </header>

      {(onEdit || onChangeEstado) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
          {onChangeEstado && (
            <label className="form__field" style={{ margin: 0 }}>
              <span style={{ fontSize: "0.75rem" }}>Estado</span>
              <select
                value={bahia.estado}
                onChange={(e) => onChangeEstado(bahia, e.target.value)}
                disabled={isUpdating}
                id={`select-estado-bahia-${bahia.id}`}
              >
                {ESTADOS_BAHIA.map((estado) => (
                  <option key={estado} value={estado}>
                    {getEstadoBahiaInfo(estado).label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {onEdit && (
            <button
              type="button"
              className="btn btn--sm btn--secondary"
              onClick={() => onEdit(bahia)}
              id={`btn-edit-bahia-${bahia.id}`}
            >
              Editar nombre
            </button>
          )}
        </div>
      )}
    </article>
  );
}
