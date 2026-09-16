import { http } from "./httpClient.js";

/**
 * @typedef {Object} TurnoCreadoResponse
 * @property {number} id_turno
 * @property {string} numero_turno
 * @property {string} estado
 * @property {string} hash_consulta
 * @property {string} qr_url
 * @property {string} fecha_ingreso
 */

/**
 * @typedef {Object} CrearTurnoPayload
 * @property {string} placa
 * @property {'AUTO' | 'CAMIONETA' | 'MOTO'} tipo_vehiculo
 * @property {string} telefono_cliente
 * @property {number} id_servicio
 * @property {number} id_operario
 * @property {number} id_bahia
 */

/**
 * @typedef {Object} Turno
 * @property {number} id
 * @property {string} numero_turno
 * @property {string} placa
 * @property {string} tipo_vehiculo
 * @property {string} telefono_cliente
 * @property {number} id_servicio
 * @property {number} id_operario
 * @property {number} id_bahia
 * @property {string} estado_actual
 * @property {string} fecha_ingreso
 * @property {string} hash_consulta
 */

/**
 * Servicio de Turnos (RF-001, RF-002 / RFF-004, RFF-005)
 */
export const turnosApi = {
  /**
   * Obtiene todos los turnos activos en recepción
   * @returns {Promise<Turno[]>}
   */
  obtenerActivos: () => http.get("/api/v1/turnos/activos"),

  /**
   * Registra el ingreso de un vehículo y genera el número de turno consecutivo
   * @param {CrearTurnoPayload} payload
   * @returns {Promise<TurnoCreadoResponse>}
   */
  crear: (payload) => http.post("/api/v1/turnos", payload),

  /**
   * Obtiene la trazabilidad en tiempo real de un vehículo por placa o hash
   * @param {string} identificador
   * @returns {Promise<any>}
   */
  obtenerTrazabilidad: (identificador) =>
    http.get(`/api/v1/turnos/trazabilidad/${encodeURIComponent(identificador)}`),

  /**
   * Actualiza la fase de lavado de un turno en patio
   * @param {number} id
   * @param {string} nuevaFase
   * @returns {Promise<Turno>}
   */
  actualizarFase: (id, nuevaFase) =>
    http.patch(`/api/v1/turnos/${id}/fase`, { nueva_fase: nuevaFase }),

  /**
   * Finaliza la atención de un turno
   * @param {number} id
   * @returns {Promise<Turno>}
   */
  finalizar: (id) => http.patch(`/api/v1/turnos/${id}/finalizar`),

  /**
   * Cancela un turno activo
   * @param {number} id
   * @returns {Promise<Turno>}
   */
  cancelar: (id) => http.patch(`/api/v1/turnos/${id}/cancelar`),
};
