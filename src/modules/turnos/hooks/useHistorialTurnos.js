import { useAsync } from "../../../shared/hooks/useAsync.js";
import { turnosService } from "../api/turnosService.js";

/**
 * Historial de turnos (opcionalmente filtrado por fecha YYYY-MM-DD y placa).
 * @param {string} [fecha]
 * @param {string} [placa]
 */
export function useHistorialTurnos(fecha = "", placa = "") {
  const { data, ...rest } = useAsync(
    () => turnosService.getHistorial(fecha || undefined, placa || undefined),
    [fecha, placa],
    { pollMs: 15000 }
  );
  return { turnos: data ?? [], ...rest };
}
