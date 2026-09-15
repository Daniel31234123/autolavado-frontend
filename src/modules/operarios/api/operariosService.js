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
   * GET /api/v1/operarios/activos
   * @returns {Promise<Operario[]>}
   */
  getActivos: () => http.get("/api/v1/operarios/activos"),

  /**
   * POST /api/v1/operarios
   * @param {CrearOperarioRequest} payload
   * @returns {Promise<Operario>}
   */
  create: (payload) => http.post("/api/v1/operarios", payload),
};
