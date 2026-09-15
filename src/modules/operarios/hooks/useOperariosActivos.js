import { useAsync } from "../../../shared/hooks/useAsync.js";
import { operariosService } from "../api/operariosService.js";

export function useOperariosActivos() {
  const { data, ...rest } = useAsync(() => operariosService.getActivos(), []);
  return { operarios: data ?? [], ...rest };
}
