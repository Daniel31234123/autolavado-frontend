import { useAsync } from "../../../shared/hooks/useAsync.js";
import { bahiasService } from "../api/bahiasService.js";

export function useBahias() {
  const { data, ...rest } = useAsync(() => bahiasService.getAll(), [], { pollMs: 15000 });
  return { bahias: data ?? [], ...rest };
}
