/**
 * Igual que en bahias/constants/bahiaEnums.js: TipoVehiculo y EstadoTurno
 * llegan del backend como enteros sin diccionario de significados en el
 * spec de OpenAPI. Estos valores son una SUPOSICIÓN razonable — confírmalos
 * con el backend y ajusta solo este archivo.
 */

export const TIPO_VEHICULO = {
  AUTO: "Carro",
  MOTO: "Moto",
  CAMIONETA: "Camioneta / SUV",
};

export const ESTADO_TURNO = {
  RECEPCION: { label: "En espera", tone: "neutral" },
  EN_SERVICIO: { label: "En servicio", tone: "warning" },
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
