import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ejecuta una función async y expone { data, error, status, refetch }.
 * Usado por los hooks de cada módulo (useBahiasDisponibles, useTurnosActivos, etc.)
 * para no repetir el mismo boilerplate de loading/error en cada uno.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {any[]} deps
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  const execute = useCallback(() => {
    setStatus("loading");
    setError(null);
    return fnRef
      .current()
      .then((result) => {
        setData(result);
        setStatus("success");
        return result;
      })
      .catch((err) => {
        setError(err);
        setStatus("error");
        throw err;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute().catch(() => {});
  }, [execute]);

  return {
    data,
    error,
    status,
    isLoading: status === "loading" || status === "idle",
    isError: status === "error",
    refetch: execute,
  };
}
