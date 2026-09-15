import { useAction } from "../../../shared/hooks/useAction.js";
import { turnosService } from "../api/turnosService.js";

export function useCrearTurno() {
  const { run, ...rest } = useAction((payload) => turnosService.create(payload));
  return { crearTurno: run, ...rest };
}
