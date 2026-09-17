import { Loader } from "../../../shared/components/Loader.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { useServicios } from "../hooks/useServicios.js";
import { ServicioCard } from "./ServicioCard.jsx";

export function ServiciosList({ onEdit }) {
  const { servicios, isLoading, isError, error, refetch } = useServicios();

  if (isLoading) return <Loader label="Cargando catálogo de servicios..." />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (servicios.length === 0) {
    return <EmptyState title="Aún no hay servicios registrados" />;
  }

  return (
    <div className="grid grid--cards">
      {servicios.map((servicio) => (
        <ServicioCard key={servicio.id} servicio={servicio} onEdit={onEdit} />
      ))}
    </div>
  );
}
