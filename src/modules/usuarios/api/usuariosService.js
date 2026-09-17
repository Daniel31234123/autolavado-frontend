import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} UsuarioAdmin
 * @property {number} id
 * @property {string} nombre_usuario
 * @property {"ADMINISTRADOR"|"OPERARIO"} rol
 * @property {boolean} activo
 * @property {string} fecha_creacion
 */

export const usuariosService = {
  /**
   * GET /api/v1/usuarios/administradores
   * @returns {Promise<UsuarioAdmin[]>}
   */
  getAll: () => http.get("/api/v1/usuarios/administradores"),

  /**
   * POST /api/v1/usuarios/administradores
   * @param {{nombre_usuario: string, contrasena: string, activo?: boolean}} payload
   * @returns {Promise<UsuarioAdmin>}
   */
  create: (payload) => http.post("/api/v1/usuarios/administradores", payload),

  /**
   * PUT /api/v1/usuarios/administradores/{id}
   * @param {number} id
   * @param {{nombre_usuario: string, activo: boolean}} payload
   * @returns {Promise<UsuarioAdmin>}
   */
  update: (id, payload) =>
    http.put(`/api/v1/usuarios/administradores/${id}`, payload),

  /**
   * PATCH /api/v1/usuarios/administradores/{id}/contrasena
   * @param {number} id
   * @param {string} contrasena
   * @returns {Promise<UsuarioAdmin>}
   */
  cambiarContrasena: (id, contrasena) =>
    http.patch(`/api/v1/usuarios/administradores/${id}/contrasena`, { contrasena }),

  /**
   * PATCH /api/v1/usuarios/administradores/{id}/desactivar
   * @param {number} id
   * @returns {Promise<UsuarioAdmin>}
   */
  desactivar: (id) =>
    http.patch(`/api/v1/usuarios/administradores/${id}/desactivar`),
};
