/**
 * El spec de OpenAPI define TipoBahia y EstadoBahia como enteros puros,
 * sin exponer qué significa cada número. Estos mapeos son una SUPOSICIÓN
 * razonable basada en el dominio (autolavado) para que la UI no muestre
 * números sueltos. Confirma los valores reales con el backend/tu amigo y
 * ajusta solo este archivo — nada más del módulo depende de los números.
 */

export const TIPO_BAHIA = {
  0: "General",
  1: "Motos",
  2: "Camionetas / SUV",
};

export const ESTADO_BAHIA = {
  0: { label: "Disponible", tone: "positive" },
  1: { label: "Ocupada", tone: "warning" },
  2: { label: "Mantenimiento", tone: "danger" },
};

export function getTipoBahiaLabel(tipo) {
  return TIPO_BAHIA[tipo] ?? `Tipo ${tipo}`;
}

export function getEstadoBahiaInfo(estado) {
  return ESTADO_BAHIA[estado] ?? { label: `Estado ${estado}`, tone: "neutral" };
}
