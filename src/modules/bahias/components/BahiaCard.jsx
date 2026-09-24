import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { getEstadoBahiaInfo, ESTADO_BAHIA } from "../constants/bahiaEnums.js";

/**
 * Estados que el administrador puede fijar manualmente. OCUPADA queda fuera:
 * lo asigna/libera el sistema según los turnos activos.
 */
const ESTADOS_MANUALES = ["DISPONIBLE", "MANTENIMIENTO"];

/**
 * Tarjeta de bahía. Muestra el nombre y el estado actual y, para el
 * administrador, permite alternar el estado entre Disponible y Mantenimiento
 * (solo cuando la bahía no está en uso por un turno activo).
 *
 * @param {{ bahia: any, canManage?: boolean, onChangeEstado?: Function,
 *           isUpdating?: boolean, error?: string|null }} props
 */
export function BahiaCard({
  bahia,
  canManage = false,
  onChangeEstado,
  isUpdating = false,
  error = null,
}) {
  const estado = String(bahia.estado || "").toUpperCase();
  const estadoInfo = getEstadoBahiaInfo(estado);
  const nombre = bahia.nombre || bahia.nombreBahia || `Bahía #${bahia.id}`;
  const esOcupada = estado === "OCUPADA";
  const mostrarControles = canManage && !esOcupada;

  return (
    <article className="card bahia-card">
      <header className="bahia-card__header">
        <h3>{nombre}</h3>
        <StatusBadge label={estadoInfo.label} tone={estadoInfo.tone} />
      </header>

      {mostrarControles && (
        <div className="bahia-card__actions">
          <div className="bahia-card__toggle" role="group" aria-label={`Cambiar estado de ${nombre}`}>
            {ESTADOS_MANUALES.map((clave) => {
              const info = ESTADO_BAHIA[clave];
              const activo = estado === clave;
              return (
                <button
                  key={clave}
                  type="button"
                  className={`bahia-card__toggle-btn bahia-card__toggle-btn--${clave.toLowerCase()}${
                    activo ? " is-active" : ""
                  }`}
                  onClick={() => {
                    if (!activo) onChangeEstado?.(bahia, clave);
                  }}
                  disabled={isUpdating || activo}
                  aria-pressed={activo}
                >
                  {info.label}
                </button>
              );
            })}
          </div>

          {isUpdating && (
            <span className="bahia-card__updating" role="status">
              <span className="spinner spinner--sm" aria-hidden="true" />
              Actualizando estado…
            </span>
          )}

          {error && (
            <p className="bahia-card__error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {canManage && esOcupada && (
        <p className="bahia-card__hint">
          En uso por un turno activo. El sistema la liberará al finalizar.
        </p>
      )}
    </article>
  );
}
