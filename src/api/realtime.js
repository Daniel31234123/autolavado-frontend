import { BASE_URL } from "./httpClient.js";
import { turnosApi } from "./turnosApi.js";

/**
 * Suscripción reactiva en tiempo real a la trazabilidad de un vehículo
 * Utiliza Server-Sent Events (SSE) con fallback de sondeo corto (polling).
 * Garantiza actualización instantánea en < 2 segundos sin recargar página.
 *
 * @param {string} identificador - Placa o Hash de consulta
 * @param {(data: any) => void} onUpdate - Callback al recibir nuevo estado
 * @param {(err: any) => void} [onError] - Callback en caso de error
 * @returns {() => void} Función para desuscribir / cerrar el canal
 */
export function suscribirTrazabilidad(identificador, onUpdate, onError) {
  if (!identificador) return () => {};

  let eventSource = null;
  let pollingInterval = null;
  let activo = true;

  // 1. Carga inicial inmediata
  turnosApi
    .obtenerTrazabilidad(identificador)
    .then((data) => {
      if (activo && onUpdate) onUpdate(data);
    })
    .catch((err) => {
      if (activo && onError) onError(err);
    });

  // 2. Intentar suscripción reactiva SSE
  try {
    const sseUrl = `${BASE_URL}/api/v1/turnos/live/${encodeURIComponent(identificador)}`;
    eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      if (!activo) return;
      try {
        const data = JSON.parse(event.data);
        if (onUpdate) onUpdate(data);
      } catch (e) {
        console.error("Error al procesar evento SSE:", e);
      }
    };

    eventSource.onerror = () => {
      // Si SSE falla por conexión o proxy, recurrimos a polling transparente de 2s
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      if (activo && !pollingInterval) {
        pollingInterval = setInterval(() => {
          if (!activo) return;
          turnosApi
            .obtenerTrazabilidad(identificador)
            .then((data) => {
              if (activo && onUpdate) onUpdate(data);
            })
            .catch(() => {});
        }, 2000);
      }
    };
  } catch {
    // Si el navegador no soporta EventSource
    pollingInterval = setInterval(() => {
      if (!activo) return;
      turnosApi
        .obtenerTrazabilidad(identificador)
        .then((data) => {
          if (activo && onUpdate) onUpdate(data);
        })
        .catch(() => {});
    }, 2000);
  }

  // Retorna función de limpieza
  return () => {
    activo = false;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}
