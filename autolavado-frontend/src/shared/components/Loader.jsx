export function Loader({ label = "Cargando..." }) {
  return (
    <div className="state-block state-block--loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
