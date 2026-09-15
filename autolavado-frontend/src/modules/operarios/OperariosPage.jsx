import { useOperariosActivos } from "./hooks/useOperariosActivos.js";
import { OperariosList } from "./components/OperariosList.jsx";
import { CrearOperarioForm } from "./components/CrearOperarioForm.jsx";

export function OperariosPage() {
  const { operarios, isLoading, isError, error, refetch } = useOperariosActivos();

  return (
    <section className="page page--split">
      <div className="page__main">
        <header className="page__header">
          <h1>Operarios</h1>
          <p>Equipo activo disponible para atender turnos.</p>
        </header>
        <OperariosList operarios={operarios} isLoading={isLoading} isError={isError} error={error} onRetry={refetch} />
      </div>

      <aside className="page__aside">
        <CrearOperarioForm onCreated={refetch} />
      </aside>
    </section>
  );
}
