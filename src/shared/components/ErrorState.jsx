export function ErrorState({ error, onRetry }) {
  const message = error?.message || "Ocurrió un error al comunicarse con la API.";
  return (
    <div className="state-block state-block--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
