import { Loader } from "../../../shared/components/Loader.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { ESTADO_TURNO, getEstadoTurnoInfo } from "../constants/turnoEnums.js";
import { TurnoCard } from "./TurnoCard.jsx";

/**
 * @param {{ turnos: import("../api/turnosService.js").Turno[], isLoading: boolean, isError: boolean, error: Error|null, onRetry: () => void }} props
 */
export function TurnosBoard({ turnos, isLoading, isError, error, onRetry }) {
  if (isLoading) return <Loader label="Cargando turnos activos..." />;
  if (isError) return <ErrorState error={error} onRetry={onRetry} />;
  if (turnos.length === 0) {
    return <EmptyState title="No hay turnos activos" description="Crea uno nuevo con el formulario de la derecha." />;
  }

  const estadosConocidos = Object.keys(ESTADO_TURNO);
  const estadosExtra = [...new Set(turnos.map((t) => t.estadoActual))].filter(
    (estado) => !estadosConocidos.includes(estado)
  );
  const columnas = [...estadosConocidos, ...estadosExtra].map((estado) => ({
    estado,
    info: getEstadoTurnoInfo(estado),
    items: turnos.filter((t) => t.estadoActual === estado),
  }));

  return (
    <div className="board">
      {columnas.map((columna) => (
        <div key={columna.estado} className="board__column">
          <header className="board__column-header">
            <span>{columna.info.label}</span>
            <span className="board__column-count">{columna.items.length}</span>
          </header>
          <div className="board__column-items">
            {columna.items.length === 0 ? (
              <p className="board__column-empty">Sin turnos</p>
            ) : (
              columna.items.map((turno) => <TurnoCard key={turno.id} turno={turno} />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
