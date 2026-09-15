import { useAsync } from "../../../shared/hooks/useAsync.js";
import { serviciosService } from "../api/serviciosService.js";

export function useServicios() {
  const { data, ...rest } = useAsync(() => serviciosService.getAll(), []);
  return { servicios: data ?? [], ...rest };
}
