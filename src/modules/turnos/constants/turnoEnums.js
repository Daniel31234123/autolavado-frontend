/**
 * Valores confirmados contra el backend (enum strings en el runtime y en
 * el spec OpenAPI): TipoVehiculo = AUTO | MOTO | CAMIONETA.
 *
 * EstadoTurno hoy solo define RECEPCION en el backend. Si agregan estados,
 * basta con sumarlos aquí: el tablero arma sus columnas a partir de este mapa.
 */

export const TIPO_VEHICULO = {
  AUTO: "Carro",
  MOTO: "Moto",
  CAMIONETA: "Camioneta / SUV",
};

export const ESTADO_TURNO = {
  RECEPCION: { label: "En espera", tone: "warning" },
  FINALIZADO: { label: "Finalizado", tone: "positive" },
  CANCELADO: { label: "Cancelado", tone: "danger" },
};


export function getTipoVehiculoLabel(tipo) {
  if (tipo === null || tipo === undefined) return "Sin especificar";
  return TIPO_VEHICULO[tipo] ?? `Tipo ${tipo}`;
}

export function getEstadoTurnoInfo(estado) {
  return ESTADO_TURNO[estado] ?? { label: `Estado ${estado}`, tone: "neutral" };
}

export const TIPO_VEHICULO_OPTIONS = Object.entries(TIPO_VEHICULO).map(([value, label]) => ({
  value,
  label,
}));
