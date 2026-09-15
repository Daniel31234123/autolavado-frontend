import { useCallback, useState } from "react";

/**
 * Envuelve una función async que el usuario dispara (submit de un form, por
 * ejemplo), exponiendo status/error/data. Distinto de useAsync: este NO se
 * ejecuta solo al montar, solo cuando se llama a run(...).
 *
 * @param {(...args: any[]) => Promise<any>} actionFn
 */
export function useAction(actionFn) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const run = useCallback(
    async (...args) => {
      setStatus("loading");
      setError(null);
      try {
        const result = await actionFn(...args);
        setData(result);
        setStatus("success");
        return result;
      } catch (err) {
        setError(err);
        setStatus("error");
        throw err;
      }
    },
    [actionFn]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setData(null);
  }, []);

  return { run, reset, data, error, isLoading: status === "loading", isError: status === "error", status };
}
