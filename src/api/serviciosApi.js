import { http } from "./httpClient.js";

/**
 * @typedef {Object} Servicio
 * @property {number} id
 * @property {string} nombre
 * @property {number} precio
 * @property {number} duracion_estimada_minutos
 * @property {string} [tipo_vehiculo]
 */

/**
 * Servicio de Servicios
 */
export const serviciosApi = {
  /**
   * Obtiene todos los servicios disponibles
   * @returns {Promise<Servicio[]>}
   */
  obtenerTodos: () => http.get("/api/v1/servicios"),
};
