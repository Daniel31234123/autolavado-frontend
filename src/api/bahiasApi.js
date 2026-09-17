import { http } from "./httpClient.js";

/**
 * @typedef {Object} Bahia
 * @property {number} id
 * @property {string} nombre
 * @property {'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO'} estado
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

  /**
   * Crea una nueva bahía
   * @param {{nombre: string}} payload
   * @returns {Promise<Bahia>}
   */
  crear: (payload) => http.post("/api/v1/bahias", payload),

  /**
   * Edita el nombre de una bahía
   * @param {number} id
   * @param {{nombre: string}} payload
   * @returns {Promise<Bahia>}
   */
  editar: (id, payload) => http.put(`/api/v1/bahias/${id}`, payload),

  /**
   * Cambia el estado de una bahía (DISPONIBLE | OCUPADA | MANTENIMIENTO)
   * @param {number} id
   * @param {string} estado
   * @returns {Promise<Bahia>}
   */
  cambiarEstado: (id, estado) =>
    http.patch(`/api/v1/bahias/${id}/estado`, { estado }),
};
