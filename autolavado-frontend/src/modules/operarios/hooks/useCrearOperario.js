import { useAction } from "../../../shared/hooks/useAction.js";
import { operariosService } from "../api/operariosService.js";

export function useCrearOperario() {
  const { run, ...rest } = useAction((payload) => operariosService.create(payload));
  return { crearOperario: run, ...rest };
}
