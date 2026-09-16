import { useState } from "react";
import { useTurnosActivos } from "./hooks/useTurnosActivos.js";
import { turnosService } from "./api/turnosService.js";
import { TurnosBoard } from "./components/TurnosBoard.jsx";
import { CrearTurnoForm } from "./components/CrearTurnoForm.jsx";
import { TurnoCreadoModal } from "./components/TurnoCreadoModal.jsx";
import { useServicios } from "../servicios/hooks/useServicios.js";
import { useOperariosActivos } from "../operarios/hooks/useOperariosActivos.js";
import { useBahiasDisponibles } from "../bahias/hooks/useBahiasDisponibles.js";

export function TurnosPage() {
  const { turnos, isLoading, isError, error, refetch: refetchTurnos } = useTurnosActivos();
  const { servicios } = useServicios();
  const { operarios, refetch: refetchOperarios } = useOperariosActivos();
  const { bahias, refetch: refetchBahias } = useBahiasDisponibles();

  const [turnoCreado, setTurnoCreado] = useState(null);
  const [actionError, setActionError] = useState(null);

  function refreshAll() {
    refetchTurnos?.({ silent: true });
    refetchBahias?.({ silent: true });
    refetchOperarios?.({ silent: true });
  }

  function handleCreated(resultado) {
    setTurnoCreado(resultado);
    refreshAll();
  }

  async function handleFinalizar(id) {
    setActionError(null);
    try {
      await turnosService.finalizar(id);
      refreshAll();
    } catch (err) {
      setActionError(err.message || "Error al finalizar el turno.");
    }
  }

  async function handleCancelar(id) {
    setActionError(null);
    if (!window.confirm("¿Seguro que deseas cancelar este turno?")) return;
    try {
      await turnosService.cancelar(id);
      refreshAll();
    } catch (err) {
      setActionError(err.message || "Error al cancelar el turno.");
    }
  }

  return (
    <section className="page page--split">
      <div className="page__main">
        <header className="page__header">
          <h1>Turnos</h1>
          <p>Fila en vivo del autolavado, agrupada por estado.</p>
        </header>

        {actionError && (
          <div className="state-block state-block--error" style={{ marginBottom: "16px" }}>
            <p className="state-block__title">Acción fallida</p>
            <p className="state-block__description">{actionError}</p>
          </div>
        )}

        <TurnosBoard
          turnos={turnos}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refreshAll}
          onFinalizar={handleFinalizar}
          onCancelar={handleCancelar}
        />
      </div>

      <aside className="page__aside">
        <CrearTurnoForm servicios={servicios} operarios={operarios} bahias={bahias} onCreated={handleCreated} />
      </aside>

      <TurnoCreadoModal turno={turnoCreado} onClose={() => setTurnoCreado(null)} />
    </section>
  );
}

