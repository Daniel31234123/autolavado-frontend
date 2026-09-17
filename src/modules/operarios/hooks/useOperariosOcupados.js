import { useAsync } from "../../../shared/hooks/useAsync.js";
import { operariosService } from "../api/operariosService.js";

export function useOperariosOcupados() {
  const { data, ...rest } = useAsync(() => operariosService.getOcupados(), []);
  return { operarios: data ?? [], ...rest };
}
