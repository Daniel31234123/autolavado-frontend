import { useAsync } from "../../../shared/hooks/useAsync.js";
import { turnosService } from "../api/turnosService.js";

export function useTurnosActivos() {
  const { data, ...rest } = useAsync(() => turnosService.getActivos(), []);
  return { turnos: data ?? [], ...rest };
}
