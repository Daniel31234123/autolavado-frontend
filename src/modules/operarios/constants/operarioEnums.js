/**
 * Enums de estado para operarios confirmados contra el backend.
 * EstadoOperario: DISPONIBLE | OCUPADO
 */

export const ESTADO_OPERARIO = {
  DISPONIBLE: { label: "Disponible", tone: "positive" },
  OCUPADO: { label: "Ocupado", tone: "warning" },
};

export function getEstadoOperarioInfo(estado) {
  return ESTADO_OPERARIO[estado] ?? { label: estado ?? "Desconocido", tone: "neutral" };
}
