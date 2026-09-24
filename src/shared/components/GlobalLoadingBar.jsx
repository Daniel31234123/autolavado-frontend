import React, { useSyncExternalStore } from "react";
import { subscribe, getSnapshot } from "../../api/requestTracker.js";

/**
 * Indicador global de actividad de red.
 *
 * Se muestra como una barra indeterminada en el borde superior y un pill
 * flotante "Sincronizando…" mientras existan peticiones al backend activas.
 * Se suscribe al store de requestTracker (alimentado por httpClient), por lo
 * que cubre toda la aplicación sin necesidad de instrumentar cada hook.
 */
export function GlobalLoadingBar() {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <>
      <div
        className={`global-loading${isVisible ? " global-loading--active" : ""}`}
        aria-hidden={!isVisible}
      >
        <span className="global-loading__bar" />
      </div>

      <div
        className={`sync-pill${isVisible ? " sync-pill--active" : ""}`}
        role="status"
        aria-live="polite"
        aria-hidden={!isVisible}
      >
        <span className="spinner spinner--sm" aria-hidden="true" />
        <span>Sincronizando…</span>
      </div>
    </>
  );
}
