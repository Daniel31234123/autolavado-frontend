import { useAsync } from "../../../shared/hooks/useAsync.js";
import { turnosService } from "../api/turnosService.js";

export function useTurnosActivos() {
  const { data, ...rest } = useAsync(() => turnosService.getActivos(), [], { pollMs: 15000 });
  return { turnos: data ?? [], ...rest };
}
