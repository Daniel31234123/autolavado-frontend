import { http } from "./httpClient.js";

/**
 * @typedef {Object} Servicio
 * @property {number} id
 * @property {string} nombre
 * @property {number} precio_base
 * @property {number} tiempo_estimado_min
 * @property {string[]} fases
 */

/**
 * @typedef {Object} CrearServicioPayload
 * @property {string} nombre
 * @property {number} precio_base
 * @property {number} tiempo_estimado_min
 * @property {string[]} fases
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

  /**
   * Crea un nuevo servicio en el catálogo
   * @param {CrearServicioPayload} payload
   * @returns {Promise<Servicio>}
   */
  crear: (payload) => http.post("/api/v1/servicios", payload),

  /**
   * Edita un servicio existente del catálogo
   * @param {number} id
   * @param {CrearServicioPayload} payload
   * @returns {Promise<Servicio>}
   */
  editar: (id, payload) => http.put(`/api/v1/servicios/${id}`, payload),
};
