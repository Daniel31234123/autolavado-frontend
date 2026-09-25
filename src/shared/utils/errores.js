const FALLBACK = "Ocurrió un error inesperado. Intenta nuevamente.";

const FASE_PERMITIDA = /solo se puede avanzar a la siguiente fase \(([^)]+)\)/i;

export function humanizarFase(valor) {
  return String(valor || "").replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function extraerMensaje(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return String(error.message || "");
}

function extraerStatus(error) {
  if (!error || typeof error === "string") return undefined;
  return error.status;
}

/**
 * Traduce los errores técnicos de la API a mensajes claros para el usuario final.
 * Conserva el detalle del backend cuando aporta contexto útil.
 */
export function mensajeErrorAmigable(error, fallback = FALLBACK) {
  const status = extraerStatus(error);
  const raw = extraerMensaje(error).trim();

  // 409 al avanzar una fase fuera de orden (el turno cambió de estado).
  const fase = raw.match(FASE_PERMITIDA);
  if (fase) {
    return `Este turno ya avanzó de fase, por eso no se pudo aplicar el cambio. La siguiente fase permitida es ${humanizarFase(fase[1])}.`;
  }

  if (raw) {
    if (/already (finalizado|cancelado|cerrado)/i.test(raw)) {
      return "Este turno ya fue cerrado y no admite más cambios.";
    }
    if (/ya está (finalizado|cerrado|cancelado)/i.test(raw)) {
      return "Este turno ya fue cerrado y no admite más cambios.";
    }
    if (/seleccionar una bahía/i.test(raw)) {
      return "Debes asignar una bahía antes de iniciar el trabajo del vehículo.";
    }
    if (/bahía .*ocupada|acaba de ser ocupada/i.test(raw)) {
      return "La bahía ya está ocupada por otro vehículo. Actualiza para ver la disponibilidad.";
    }
    if (/está asignado a otro operario/i.test(raw)) {
      return "Este turno pertenece a otro operario.";
    }
  }

  switch (status) {
    case 0:
      return "No pudimos conectar con el servidor. Revisa tu conexión a internet.";
    case 400:
      return raw || "Los datos enviados no son válidos. Revisa la información e intenta de nuevo.";
    case 401:
      return "Tu sesión expiró. Vuelve a iniciar sesión.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return raw || "No encontramos la información solicitada.";
    case 409:
      return raw
        ? `La acción no se pudo completar porque la información cambió: ${raw}`
        : "La acción no se pudo completar porque la información cambió. Actualiza e intenta de nuevo.";
    case 422:
      return raw || "Algunos datos no cumplen las reglas del sistema. Revísalos e intenta de nuevo.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "El servidor presentó un problema. Espera unos segundos e intenta nuevamente.";
    default:
      return raw || fallback;
  }
}
