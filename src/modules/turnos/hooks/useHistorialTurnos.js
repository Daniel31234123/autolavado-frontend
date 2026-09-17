import { useAsync } from "../../../shared/hooks/useAsync.js";
import { turnosService } from "../api/turnosService.js";

/**
 * Historial de turnos (opcionalmente filtrado por fecha YYYY-MM-DD).
 * @param {string} [fecha]
 */
export function useHistorialTurnos(fecha = "") {
  const { data, ...rest } = useAsync(
    () => turnosService.getHistorial(fecha || undefined),
    [fecha],
    { pollMs: 15000 }
  );
  return { turnos: data ?? [], ...rest };
}
