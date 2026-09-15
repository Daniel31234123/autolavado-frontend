import { useState } from "react";
import { useTurnosActivos } from "./hooks/useTurnosActivos.js";
import { TurnosBoard } from "./components/TurnosBoard.jsx";
import { CrearTurnoForm } from "./components/CrearTurnoForm.jsx";
import { TurnoCreadoModal } from "./components/TurnoCreadoModal.jsx";
import { useServicios } from "../servicios/hooks/useServicios.js";
import { useOperariosActivos } from "../operarios/hooks/useOperariosActivos.js";
import { useBahiasDisponibles } from "../bahias/hooks/useBahiasDisponibles.js";

export function TurnosPage() {
  const { turnos, isLoading, isError, error, refetch } = useTurnosActivos();
  const { servicios } = useServicios();
  const { operarios } = useOperariosActivos();
  const { bahias } = useBahiasDisponibles();

  const [turnoCreado, setTurnoCreado] = useState(null);

  function handleCreated(resultado) {
    setTurnoCreado(resultado);
    refetch();
  }

  return (
    <section className="page page--split">
      <div className="page__main">
        <header className="page__header">
          <h1>Turnos</h1>
          <p>Fila en vivo del autolavado, agrupada por estado.</p>
        </header>
        <TurnosBoard turnos={turnos} isLoading={isLoading} isError={isError} error={error} onRetry={refetch} />
      </div>

      <aside className="page__aside">
        <CrearTurnoForm servicios={servicios} operarios={operarios} bahias={bahias} onCreated={handleCreated} />
      </aside>

      <TurnoCreadoModal turno={turnoCreado} onClose={() => setTurnoCreado(null)} />
    </section>
  );
}
