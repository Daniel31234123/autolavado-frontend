/**
 * Enums de estado para operarios confirmados contra el backend.
 * EstadoOperario: DISPONIBLE | OCUPADO | INACTIVO
 */

export const ESTADO_OPERARIO = {
  DISPONIBLE: { label: "Disponible", tone: "positive" },
  OCUPADO: { label: "Ocupado", tone: "warning" },
  INACTIVO: { label: "Inactivo", tone: "danger" },
};

export function getEstadoOperarioInfo(estado) {
  return ESTADO_OPERARIO[estado] ?? { label: estado ?? "Desconocido", tone: "neutral" };
}
