import { useAsync } from "../../../shared/hooks/useAsync.js";
import { bahiasService } from "../api/bahiasService.js";

export function useBahiasDisponibles() {
  const { data, ...rest } = useAsync(() => bahiasService.getDisponibles(), []);
  return { bahias: data ?? [], ...rest };
}
