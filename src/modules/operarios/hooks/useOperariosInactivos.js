import { useAsync } from "../../../shared/hooks/useAsync.js";
import { operariosService } from "../api/operariosService.js";

export function useOperariosInactivos() {
  const { data, ...rest } = useAsync(() => operariosService.getInactivos(), []);
  return { operarios: data ?? [], ...rest };
}
