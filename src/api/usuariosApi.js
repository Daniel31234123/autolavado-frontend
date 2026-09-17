import { http } from "./httpClient.js";

/**
 * @typedef {Object} UsuarioAdmin
 * @property {number} id
 * @property {string} nombre_usuario
 * @property {'ADMINISTRADOR' | 'OPERARIO'} rol
 * @property {boolean} activo
 * @property {string} fecha_creacion
 */

/**
 * Servicio de Usuarios Administradores
 */
export const usuariosApi = {
  /**
   * Lista todas las cuentas de administrador
   * @returns {Promise<UsuarioAdmin[]>}
   */
  listar: () => http.get("/api/v1/usuarios/administradores"),

  /**
   * Crea una cuenta de administrador
   * @param {{nombre_usuario: string, contrasena: string, activo?: boolean}} payload
   * @returns {Promise<UsuarioAdmin>}
   */
  crear: (payload) => http.post("/api/v1/usuarios/administradores", payload),

  /**
   * Edita el nombre de usuario y/o el estado activo de un administrador
   * @param {number} id
   * @param {{nombre_usuario: string, activo: boolean}} payload
   * @returns {Promise<UsuarioAdmin>}
   */
  editar: (id, payload) =>
    http.put(`/api/v1/usuarios/administradores/${id}`, payload),

  /**
   * Cambia la contraseña de un administrador
   * @param {number} id
   * @param {string} contrasena
   * @returns {Promise<UsuarioAdmin>}
   */
  cambiarContrasena: (id, contrasena) =>
    http.patch(`/api/v1/usuarios/administradores/${id}/contrasena`, { contrasena }),

  /**
   * Desactiva la cuenta de un administrador
   * @param {number} id
   * @returns {Promise<UsuarioAdmin>}
   */
  desactivar: (id) =>
    http.patch(`/api/v1/usuarios/administradores/${id}/desactivar`),
};
