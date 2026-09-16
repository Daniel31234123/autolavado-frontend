import { http } from "./httpClient.js";

/**
 * Servicio de Autenticación (RF-003 / RFF-001)
 */
export const authApi = {
  /**
   * Inicia sesión con credenciales.
   * @param {string} nombre_usuario
   * @param {string} contrasena
   * @returns {Promise<{ token: string, rol: string, nombre_usuario: string, expira_en: string }>}
   */
  login: (nombre_usuario, contrasena) =>
    http.post("/api/v1/auth/login", {
      nombre_usuario: nombre_usuario.trim(),
      contrasena,
    }),
};
