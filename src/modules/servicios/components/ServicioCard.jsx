/**
 * @param {{ servicio: import("../api/serviciosService.js").Servicio }} props
 */
export function ServicioCard({ servicio }) {
  const precio = Number(servicio.precioBase);
  const precioFmt = Number.isFinite(precio)
    ? precio.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    : servicio.precioBase;

  return (
    <article className="card servicio-card">
      <h3>{servicio.nombre}</h3>
      <div className="servicio-card__meta">
        <span>{precioFmt}</span>
        <span>{servicio.tiempoEstimadoMin} min aprox.</span>
      </div>
    </article>
  );
}
