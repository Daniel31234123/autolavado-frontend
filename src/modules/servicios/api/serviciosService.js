import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Servicio
 * @property {string} id
 * @property {string} nombre
 * @property {number|string} precioBase
 * @property {number|string} tiempoEstimadoMin
 */

function normalize(servicio) {
  return {
    ...servicio,
    precioBase: servicio.precio_base,
    tiempoEstimadoMin: servicio.tiempo_estimado_min,
  };
}

export const serviciosService = {
  /**
   * GET /api/v1/servicios
   * @returns {Promise<Servicio[]>}
   */
  getAll: async () => {
    const servicios = await http.get("/api/v1/servicios");
    return servicios.map(normalize);
  },

  /**
   * POST /api/v1/servicios
   * @param {{nombre: string, precio_base: number, tiempo_estimado_min: number, fases: string[]}} payload
   * @returns {Promise<Servicio>}
   */
  create: async (payload) => normalize(await http.post("/api/v1/servicios", payload)),

  /**
   * PUT /api/v1/servicios/{id}
   * @param {string|number} id
   * @param {{nombre: string, precio_base: number, tiempo_estimado_min: number, fases: string[]}} payload
   * @returns {Promise<Servicio>}
   */
  update: async (id, payload) =>
    normalize(await http.put(`/api/v1/servicios/${id}`, payload)),
};
