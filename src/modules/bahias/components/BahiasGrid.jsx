import { Loader } from "../../../shared/components/Loader.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { useBahiasDisponibles } from "../hooks/useBahiasDisponibles.js";
import { BahiaCard } from "./BahiaCard.jsx";

export function BahiasGrid() {
  const { bahias, isLoading, isError, error, refetch } = useBahiasDisponibles();

  if (isLoading) return <Loader label="Cargando bahías disponibles..." />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const hasBahiaMantenimiento = bahias.some(
    (bahia) => bahia.id === "4" || bahia.nombreBahia?.trim().toLowerCase() === "bahía 4"
  );
  const bahiasVisibles = hasBahiaMantenimiento
    ? bahias
    : [...bahias, { id: "4", nombreBahia: "Bahía 4", tipo: 0, estado: 2 }];

  if (bahiasVisibles.length === 0) {
    return (
      <EmptyState
        title="No hay bahías disponibles ahora mismo"
        description="Todas las bahías están ocupadas o en mantenimiento."
      />
    );
  }

  return (
    <div className="grid grid--cards">
      {bahiasVisibles.map((bahia) => (
        <BahiaCard key={bahia.id} bahia={bahia} />
      ))}
    </div>
  );
}
