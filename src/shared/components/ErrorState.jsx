import { mensajeErrorAmigable } from "../utils/errores.js";
import { Alert } from "./Alert.jsx";

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-block state-block--error" role="alert">
      <Alert variant="danger" title="No pudimos cargar la información">
        {mensajeErrorAmigable(error, "Ocurrió un error al comunicarse con la API.")}
      </Alert>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
