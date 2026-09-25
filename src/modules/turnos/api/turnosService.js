import { http } from "../../../api/httpClient.js";

/**
 * @typedef {Object} Turno
 * @property {string} id
 * @property {string} numeroTurno
 * @property {string} placa
 * @property {"AUTO"|"MOTO"|"CAMIONETA"} tipoVehiculo - ver constants/turnoEnums.js -> TIPO_VEHICULO
 * @property {string} telefonoCliente
 * @property {string} [idServicio]
 * @property {string} [idOperario]
 * @property {string} [idBahia]
 * @property {string} estadoActual    - ver constants/turnoEnums.js -> ESTADO_TURNO
 * @property {string} fechaIngreso
 * @property {string} hashConsulta
 */

/**
 * @typedef {Object} CrearTurnoRequest
 * @property {string} placa            - exactamente 6 caracteres
 * @property {"AUTO"|"MOTO"|"CAMIONETA"} tipo_vehiculo - obligatorio
 * @property {string} telefono_cliente - exactamente 10 dígitos
 * @property {string} id_servicio      - obligatorio
 * La asignación de operario y bahía es automática en el backend (RF-02, RN-02).
 */

/**
 * @typedef {Object} TurnoCreadoResponse
 * @property {string} idTurno
 * @property {string} numeroTurno
 * @property {string} estado
 * @property {string} hashConsulta
 * @property {string} qrUrl
 * @property {string} fechaIngreso
 */

function normalizeTurno(turno) {
  return {
    ...turno,
    numeroTurno: turno.numero_turno,
    tipoVehiculo: turno.tipo_vehiculo,
    telefonoCliente: turno.telefono_cliente,
    idServicio: turno.id_servicio,
    idOperario: turno.id_operario,
    idBahia: turno.id_bahia,
    estadoActual: turno.estado_actual,
    fechaIngreso: turno.fecha_ingreso,
    hashConsulta: turno.hash_consulta,
  };
}

export const turnosService = {
  /**
   * GET /api/v1/turnos/activos
   * @returns {Promise<Turno[]>}
   */
  getActivos: async () => {
    const turnos = await http.get("/api/v1/turnos/activos");
    return turnos.map(normalizeTurno);
  },

  /**
   * GET /api/v1/turnos/tablero  (RF-05)
   * @returns {Promise<{en_atencion: any[], en_cola: any[], total: number}>}
   */
  getTablero: async () => {
    const tablero = await http.get("/api/v1/turnos/tablero");
    return {
      en_atencion: (tablero.en_atencion ?? []).map(normalizeTurno),
      en_cola: (tablero.en_cola ?? []).map(normalizeTurno),
      total: tablero.total ?? 0,
    };
  },

  /**
   * GET /api/v1/turnos/historial  (todos los turnos, activos y cerrados)
   * @param {string} [fecha] - filtro opcional YYYY-MM-DD
   * @param {string} [placa] - filtro opcional por placa
   * @returns {Promise<Turno[]>}
   */
  getHistorial: async (fecha, placa) => {
    const params = new URLSearchParams();
    if (fecha) params.append("fecha", fecha);
    if (placa) params.append("placa", String(placa).trim().toUpperCase());
    const query = params.toString() ? `?${params.toString()}` : "";
    const turnos = await http.get(`/api/v1/turnos/historial${query}`);
    return (turnos || []).map(normalizeTurno);
  },

  /**
   * GET /api/v1/turnos/display
   * @returns {Promise<any[]>}
   */
  getDisplay: () => http.get("/api/v1/turnos/display"),

  /**
   * GET /api/v1/turnos/mio  (RF-04)
   * @returns {Promise<any>}
   */
  getMio: async () => normalizeTurno(await http.get("/api/v1/turnos/mio")),

  /**
   * GET /api/v1/turnos/mios  (RF-04)
   * @returns {Promise<any[]>}
   */
  getMios: async () => {
    const turnos = await http.get("/api/v1/turnos/mios");
    return turnos.map(normalizeTurno);
  },

  /**
   * PATCH /api/v1/turnos/{id}/bahia
   * @param {string|number} id
   * @param {string|number} idBahia
   * @returns {Promise<Turno>}
   */
  asignarBahia: async (id, idBahia) =>
    normalizeTurno(await http.patch(`/api/v1/turnos/${id}/bahia`, { id_bahia: idBahia })),

  /**
   * POST /api/v1/turnos
   * @param {CrearTurnoRequest} payload
   * @returns {Promise<TurnoCreadoResponse>}
   */
  create: async (payload) => {
    const turno = await http.post("/api/v1/turnos", payload);
    return {
      ...turno,
      idTurno: turno.id_turno,
      numeroTurno: turno.numero_turno,
      hashConsulta: turno.hash_consulta,
      qrUrl: turno.qr_url,
      fechaIngreso: turno.fecha_ingreso,
    };
  },

  /**
   * PATCH /api/v1/turnos/{id}/finalizar
   * @param {string|number} id
   * @returns {Promise<Turno>}
   */
  finalizar: async (id) =>
    normalizeTurno(await http.patch(`/api/v1/turnos/${id}/finalizar`)),

  /**
   * PATCH /api/v1/turnos/{id}/cancelar
   * @param {string|number} id
   * @returns {Promise<Turno>}
   */
  cancelar: async (id) =>
    normalizeTurno(await http.patch(`/api/v1/turnos/${id}/cancelar`)),
};

