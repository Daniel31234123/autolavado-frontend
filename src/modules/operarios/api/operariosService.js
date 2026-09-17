import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Operario
 * @property {string} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} documento
 * @property {string} telefono
 * @property {boolean} activo
 */

/**
 * @typedef {Object} CrearOperarioRequest
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} documento
 * @property {string} telefono   - solo dígitos, máx. 10
 * @property {boolean} [activo]
 */

export const operariosService = {
  /**
   * GET /api/v1/operarios
   * @returns {Promise<Operario[]>}
   */
  getAll: () => http.get("/api/v1/operarios"),

  /**
   * GET /api/v1/operarios/activos
   * @returns {Promise<Operario[]>}
   */
  getActivos: () => http.get("/api/v1/operarios/activos"),

  /**
   * GET /api/v1/operarios/inactivos
   * @returns {Promise<Operario[]>}
   */
  getInactivos: () => http.get("/api/v1/operarios/inactivos"),

  /**
   * GET /api/v1/operarios/ocupados
   * @returns {Promise<Operario[]>}
   */
  getOcupados: () => http.get("/api/v1/operarios/ocupados"),

  /**
   * POST /api/v1/operarios
   * @param {CrearOperarioRequest} payload
   * @returns {Promise<Operario>}
   */
  create: (payload) => http.post("/api/v1/operarios", payload),

  /**
   * PUT /api/v1/operarios/{id}
   * @param {string|number} id
   * @param {Object} payload
   * @returns {Promise<Operario>}
   */
  update: (id, payload) => http.put(`/api/v1/operarios/${id}`, payload),

  /**
   * PATCH /api/v1/operarios/{id}/estado
   * @param {string|number} id
   * @param {'DISPONIBLE'|'OCUPADO'|'INACTIVO'} estado
   * @returns {Promise<Operario>}
   */
  cambiarEstado: (id, estado) =>
    http.patch(`/api/v1/operarios/${id}/estado`, { estado }),

  /**
   * PATCH /api/v1/operarios/{id}/desactivar
   * @param {string|number} id
   * @returns {Promise<Operario>}
   */
  desactivar: (id) => http.patch(`/api/v1/operarios/${id}/desactivar`),
};
