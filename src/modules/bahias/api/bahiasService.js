import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Bahia
 * @property {string} id
 * @property {string} nombre
 * @property {"DISPONIBLE"|"OCUPADA"|"MANTENIMIENTO"} estado - ver constants/bahiaEnums.js -> ESTADO_BAHIA
 */

function normalize(bahia) {
  return { ...bahia, nombreBahia: bahia.nombre || bahia.nombre_bahia };
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

  /**
   * POST /api/v1/bahias
   * @param {{nombre: string}} payload
   * @returns {Promise<Bahia>}
   */
  create: async (payload) => normalize(await http.post("/api/v1/bahias", payload)),

  /**
   * PUT /api/v1/bahias/{id}
   * @param {string|number} id
   * @param {{nombre: string}} payload
   * @returns {Promise<Bahia>}
   */
  update: async (id, payload) =>
    normalize(await http.put(`/api/v1/bahias/${id}`, payload)),

  /**
   * PATCH /api/v1/bahias/{id}/estado
   * @param {string|number} id
   * @param {string} estado
   * @returns {Promise<Bahia>}
   */
  cambiarEstado: async (id, estado) =>
    normalize(await http.patch(`/api/v1/bahias/${id}/estado`, { estado })),
};
