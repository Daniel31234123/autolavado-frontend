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

  /**
   * RF-05: Tablero consolidado del administrador con autos en atención y en cola
   * @returns {Promise<{en_atencion: any[], en_cola: any[], total: number}>}
   */
  obtenerTablero: () => http.get("/api/v1/turnos/tablero"),

  /**
   * Historial completo de turnos (activos y cerrados) para el administrador
   * @param {string} [fecha] - filtro opcional YYYY-MM-DD
   * @returns {Promise<any[]>}
   */
  obtenerHistorial: (fecha) => {
    const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
    return http.get(`/api/v1/turnos/historial${query}`);
  },

  /**
   * Pantalla pública de display con el avance de los vehículos en patio
   * @returns {Promise<any[]>}
   */
  obtenerDisplay: () => http.get("/api/v1/turnos/display"),

  /**
   * RF-04: Turno actualmente asignado al operario autenticado
   * @returns {Promise<any>}
   */
  obtenerMio: () => http.get("/api/v1/turnos/mio"),

  /**
   * RF-04: Listado de turnos asignados al operario autenticado
   * @returns {Promise<any[]>}
   */
  obtenerMios: () => http.get("/api/v1/turnos/mios"),

  /**
   * Asigna o reasigna una bahía a un turno
   * @param {number} id
   * @param {number} idBahia
   * @returns {Promise<Turno>}
   */
  asignarBahia: (id, idBahia) =>
    http.patch(`/api/v1/turnos/${id}/bahia`, { id_bahia: idBahia }),
};
