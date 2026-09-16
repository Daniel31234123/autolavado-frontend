import { http } from "./httpClient.js";

/**
  * Servicio de Reservas y Disponibilidad (RF-CL-01)
  */
export const reservasApi = {
  /**
   * Consulta la disponibilidad de horarios por fecha
   * @param {string} fecha - YYYY-MM-DD
   * @returns {Promise<{fecha: string, operarios_activos: number, franjas: Array<{hora: string, capacidad_total: number, cupos_ocupados: number, cupos_disponibles: number, disponible: boolean}>}>}
   */
  consultarDisponibilidad: (fecha) =>
    http.get(`/api/v1/reservas/disponibilidad?fecha=${encodeURIComponent(fecha)}`),

  /**
   * Crea una nueva reserva para un cliente
   * @param {{placa: string, tipo_vehiculo?: string, telefono_cliente?: string, id_servicio: number, fecha_reserva: string, hora_reserva: string}} payload
   * @returns {Promise<any>}
   */
  crear: (payload) => http.post("/api/v1/reservas", payload),

  /**
   * Obtiene los detalles de una reserva por su código alfanumérico (ej: RES-4821)
   * @param {string} codigo
   * @returns {Promise<any>}
   */
  obtenerPorCodigo: (codigo) =>
    http.get(`/api/v1/reservas/${encodeURIComponent(codigo)}`),

  /**
   * Obtiene el listado de reservas (para administración)
   * @param {{fecha?: string, placa?: string}} [params]
   * @returns {Promise<any[]>}
   */
  obtenerTodas: (params = {}) => {
    const query = new URLSearchParams();
    if (params.fecha) query.append("fecha", params.fecha);
    if (params.placa) query.append("placa", params.placa);
    const qs = query.toString();
    return http.get(`/api/v1/reservas${qs ? `?${qs}` : ""}`);
  },

  /**
   * Cancela una reserva
   * @param {number} id
   * @returns {Promise<any>}
   */
  cancelar: (id) => http.patch(`/api/v1/reservas/${id}/cancelar`),

  /**
   * Convierte una reserva en turno activo de patio
   * @param {number} id
   * @returns {Promise<any>}
   */
  iniciarTurno: (id) => http.post(`/api/v1/reservas/${id}/iniciar-turno`),
};
