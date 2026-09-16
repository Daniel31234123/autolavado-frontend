import { http } from "./httpClient.js";

export const vehiculosApi = {
  /**
   * Obtiene la información registrada de un vehículo por su placa
   * @param {string} placa
   * @returns {Promise<any>}
   */
  obtenerPorPlaca: (placa) =>
    http.get(`/api/v1/vehiculos/${encodeURIComponent(placa)}`),

  /**
   * Busca vehículos por prefijo de placa para autocompletado
   * @param {string} prefijo
   * @returns {Promise<any[]>}
   */
  buscar: (prefijo) =>
    http.get(`/api/v1/vehiculos/buscar?prefijo=${encodeURIComponent(prefijo)}`),
};
