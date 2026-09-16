import { Loader } from "../../../shared/components/Loader.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { useBahias } from "../hooks/useBahias.js";
import { BahiaCard } from "./BahiaCard.jsx";

export function BahiasGrid() {
  const { bahias, isLoading, isError, error, refetch } = useBahias();

  if (isLoading) return <Loader label="Cargando bahías..." />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  if (bahias.length === 0) {
    return (
      <EmptyState
        title="No hay bahías registradas"
        description="No hay bahias disponibles en este momento."
      />
    );
  }

  return (
    <div className="grid grid--cards">
      {bahias.map((bahia) => (
        <BahiaCard key={bahia.id} bahia={bahia} />
      ))}
    </div>
  );
}
