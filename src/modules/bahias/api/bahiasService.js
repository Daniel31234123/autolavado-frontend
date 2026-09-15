import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Bahia
 * @property {string} id
 * @property {string} nombreBahia
 * @property {number} tipo    - ver constants/bahiaEnums.js -> TIPO_BAHIA
 * @property {number} estado  - ver constants/bahiaEnums.js -> ESTADO_BAHIA
 */

export const bahiasService = {
  /**
   * GET /api/v1/bahias/disponibles
   * @returns {Promise<Bahia[]>}
   */
  getDisponibles: async () => {
    const bahias = await http.get("/api/v1/bahias/disponibles");
    return bahias.map((bahia) => ({ ...bahia, nombreBahia: bahia.nombre_bahia }));
  },
};
