/**
 * @param {{ servicio: import("../api/serviciosService.js").Servicio, onEdit?: (servicio: any) => void }} props
 */
export function ServicioCard({ servicio, onEdit }) {
  const precio = Number(servicio.precioBase);
  const precioFmt = Number.isFinite(precio)
    ? precio.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    : servicio.precioBase;

  const fases = Array.isArray(servicio.fases) ? servicio.fases : [];

  return (
    <article className="card servicio-card">
      <div className="servicio-card__head">
        <h3>{String(servicio.nombre).replace(/_/g, " ")}</h3>
        {onEdit && (
          <button
            type="button"
            className="btn btn--sm btn--secondary servicio-card__edit"
            onClick={() => onEdit(servicio)}
            id={`btn-edit-servicio-${servicio.id}`}
          >
            Editar
          </button>
        )}
      </div>
      <div className="servicio-card__meta">
        <span>{precioFmt}</span>
        <span>{servicio.tiempoEstimadoMin} min aprox.</span>
      </div>
      {fases.length > 0 && (
        <p className="servicio-card__fases">
          Fases: {fases.map((f) => String(f).replace(/_/g, " ")).join(" / ")}
        </p>
      )}
    </article>
  );
}
