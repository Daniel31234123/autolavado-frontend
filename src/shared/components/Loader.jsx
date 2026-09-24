export function Loader({ label = "Cargando..." }) {
  return (
    <div className="state-block state-block--loading" role="status" aria-live="polite">
      <span className="loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="state-block__label">{label}</span>
    </div>
  );
}
