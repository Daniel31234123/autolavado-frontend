import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Servicio
 * @property {string} id
 * @property {string} nombre
 * @property {number|string} precioBase
 * @property {number|string} tiempoEstimadoMin
 */

export const serviciosService = {
  /**
   * GET /api/v1/servicios
   * @returns {Promise<Servicio[]>}
   */
  getAll: async () => {
    const servicios = await http.get("/api/v1/servicios");
    return servicios.map((servicio) => ({
      ...servicio,
      precioBase: servicio.precio_base,
      tiempoEstimadoMin: servicio.tiempo_estimado_min,
    }));
  },
};
