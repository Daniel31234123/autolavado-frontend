import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Bahia
 * @property {string} id
 * @property {string} nombreBahia
 * @property {"GENERAL"|"DETAILING"|"SECADO"} tipo        - ver constants/bahiaEnums.js -> TIPO_BAHIA
 * @property {"DISPONIBLE"|"OCUPADA"|"MANTENIMIENTO"} estado - ver constants/bahiaEnums.js -> ESTADO_BAHIA
 */

function normalize(bahia) {
  return { ...bahia, nombreBahia: bahia.nombre_bahia };
}

export const bahiasService = {
  /**
   * GET /api/v1/bahias
   * Todas las bahías con su estado (para monitoreo).
   * @returns {Promise<Bahia[]>}
   */
  getAll: async () => {
    const bahias = await http.get("/api/v1/bahias");
    return bahias.map(normalize);
  },

  /**
   * GET /api/v1/bahias/disponibles
   * Solo bahías disponibles (para asignar en el formulario de turno).
   * @returns {Promise<Bahia[]>}
   */
  getDisponibles: async () => {
    const bahias = await http.get("/api/v1/bahias/disponibles");
    return bahias.map(normalize);
  },
};
