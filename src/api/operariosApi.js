import { http } from "./httpClient.js";

/**
 * @typedef {Object} Operario
 * @property {number} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} documento
 * @property {string} telefono
 * @property {boolean} activo
 * @property {'ACTIVO' | 'INACTIVO' | 'OCUPADO' | 'Activo' | 'Inactivo' | 'Ocupado'} estado
 * @property {string} nombre_usuario
 * @property {string} [fecha_creacion]
 */

/**
 * @typedef {Object} CrearOperarioPayload
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} documento
 * @property {string} telefono
 * @property {string} nombre_usuario
 * @property {string} contrasena
 */

/**
 * @typedef {Object} EditarOperarioPayload
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} documento
 * @property {string} telefono
 */

/**
 * Servicio de Operarios (RF-004 / RFF-006, RFF-007, RFF-008, RFF-009)
 */
export const operariosApi = {
  /**
   * Obtiene todos los operarios (Solo Administrador)
   * @returns {Promise<Operario[]>}
   */
  obtenerTodos: () => http.get("/api/v1/operarios"),

  /**
   * Obtiene los operarios activos (para asignación en turnos)
   * @returns {Promise<Operario[]>}
   */
  obtenerActivos: () => http.get("/api/v1/operarios/activos"),

  /**
   * Obtiene los operarios inactivos
   * @returns {Promise<Operario[]>}
   */
  obtenerInactivos: () => http.get("/api/v1/operarios/inactivos"),

  /**
   * Obtiene los operarios ocupados
   * @returns {Promise<Operario[]>}
   */
  obtenerOcupados: () => http.get("/api/v1/operarios/ocupados"),

  /**
   * Crea un nuevo operario con cuenta de usuario vinculada
   * @param {CrearOperarioPayload} payload
   * @returns {Promise<Operario>}
   */
  crear: (payload) => http.post("/api/v1/operarios", payload),

  /**
   * Actualiza datos básicos de un operario (nombres, apellidos, documento, teléfono)
   * @param {number} id
   * @param {EditarOperarioPayload} payload
   * @returns {Promise<Operario>}
   */
  editar: (id, payload) => http.put(`/api/v1/operarios/${id}`, payload),

  /**
   * Desactiva un operario (cambio de estado a INACTIVO)
   * @param {number} id
   * @returns {Promise<Operario>}
   */
  desactivar: (id) => http.patch(`/api/v1/operarios/${id}/desactivar`),

  /**
   * RF-03: Cambia el estado laboral del operario para las asignaciones automáticas.
   * @param {number} id
   * @param {'DISPONIBLE' | 'OCUPADO' | 'INACTIVO'} estado
   * @returns {Promise<Operario>}
   */
  cambiarEstado: (id, estado) =>
    http.patch(`/api/v1/operarios/${id}/estado`, { estado }),
};
