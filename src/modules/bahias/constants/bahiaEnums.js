/**
 * Valores confirmados contra el backend (enum strings en el runtime y en
 * el spec OpenAPI): TipoBahia = GENERAL | DETAILING | SECADO y
 * EstadoBahia = DISPONIBLE | OCUPADA | MANTENIMIENTO.
 */

export const TIPO_BAHIA = {
  GENERAL: "General",
  DETAILING: "Detailing",
  SECADO: "Secado",
};

export const ESTADO_BAHIA = {
  DISPONIBLE: { label: "Disponible", tone: "positive" },
  OCUPADA: { label: "Ocupada", tone: "warning" },
  MANTENIMIENTO: { label: "Mantenimiento", tone: "danger" },
};

export function getTipoBahiaLabel(tipo) {
  return TIPO_BAHIA[tipo] ?? `Tipo ${tipo}`;
}

export function getEstadoBahiaInfo(estado) {
  return ESTADO_BAHIA[estado] ?? { label: `Estado ${estado}`, tone: "neutral" };
}
