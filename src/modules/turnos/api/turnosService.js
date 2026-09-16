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
 * @property {string} id_operario      - obligatorio
 * @property {string} id_bahia         - obligatorio
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

export const turnosService = {
  /**
   * GET /api/v1/turnos/activos
   * @returns {Promise<Turno[]>}
   */
  getActivos: async () => {
    const turnos = await http.get("/api/v1/turnos/activos");
    return turnos.map((turno) => ({
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
    }));
  },

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
};
