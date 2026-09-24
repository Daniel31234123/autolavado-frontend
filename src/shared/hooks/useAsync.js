import { useCallback, useEffect, useRef, useState } from "react";
import { runInBackground } from "../../api/requestTracker.js";

/**
 * Ejecuta una función async y expone { data, error, status, refetch }.
 * Usado por los hooks de cada módulo (useBahiasDisponibles, useTurnosActivos, etc.)
 * para no repetir el mismo boilerplate de loading/error en cada uno.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {any[]} deps
 * @param {{ pollMs?: number }} [options] - si pollMs > 0, refresca en segundo
 *   plano sin volver a mostrar el loader ni pisar datos ya cargados.
 */
export function useAsync(asyncFn, deps = [], options = {}) {
  const { pollMs = 0 } = options;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  const execute = useCallback(({ silent = false } = {}) => {
    if (!silent) {
      setStatus("loading");
      setError(null);
    }
    // Los sondeos silenciosos no encienden el indicador global de peticiones.
    const invoke = silent
      ? () => runInBackground(() => fnRef.current())
      : () => fnRef.current();
    return invoke()
      .then((result) => {
        setData(result);
        setStatus("success");
        return result;
      })
      .catch((err) => {
        if (!silent) {
          setError(err);
          setStatus("error");
        }
        throw err;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute().catch(() => {});
  }, [execute]);

  useEffect(() => {
    if (!pollMs) return undefined;
    const id = setInterval(() => execute({ silent: true }).catch(() => {}), pollMs);
    return () => clearInterval(id);
  }, [execute, pollMs]);

  return {
    data,
    error,
    status,
    isLoading: status === "loading" || status === "idle",
    isError: status === "error",
    refetch: execute,
  };
}
