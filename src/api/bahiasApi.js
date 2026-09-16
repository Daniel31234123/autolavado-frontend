import { http } from "./httpClient.js";

/**
 * @typedef {Object} Bahia
 * @property {number} id
 * @property {string} numero
 * @property {string} tipo
 * @property {'Disponible' | 'Ocupada' | 'Mantenimiento' | 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO'} estado
 */

/**
 * Servicio de Bahías
 */
export const bahiasApi = {
  /**
   * Obtiene todas las bahías
   * @returns {Promise<Bahia[]>}
   */
  obtenerTodas: () => http.get("/api/v1/bahias"),

  /**
   * Obtiene solo las bahías disponibles para asignar turno
   * @returns {Promise<Bahia[]>}
   */
  obtenerDisponibles: () => http.get("/api/v1/bahias/disponibles"),
};
