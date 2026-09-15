import { Loader } from "../../../shared/components/Loader.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { OperarioCard } from "./OperarioCard.jsx";

/**
 * Componente presentacional: recibe el estado ya resuelto por la página
 * (que es quien llama a useOperariosActivos), así puede reusarse aunque
 * cambie de dónde vienen los datos.
 */
export function OperariosList({ operarios, isLoading, isError, error, onRetry }) {
  if (isLoading) return <Loader label="Cargando operarios..." />;
  if (isError) return <ErrorState error={error} onRetry={onRetry} />;
  if (operarios.length === 0) {
    return <EmptyState title="Todavía no hay operarios activos" description="Registra el primero con el formulario." />;
  }

  return (
    <div className="grid grid--list">
      {operarios.map((operario) => (
        <OperarioCard key={operario.id} operario={operario} />
      ))}
    </div>
  );
}
