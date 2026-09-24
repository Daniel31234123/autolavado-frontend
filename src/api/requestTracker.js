/**
 * Rastreador global de peticiones al backend.
 *
 * Cada request que pasa por httpRequest incrementa/descuenta un contador.
 * El indicador visual (GlobalLoadingBar) se suscribe a este store.
 *
 * Para evitar parpadeos con peticiones muy rápidas (ej: el sondeo cada 2 s),
 * la barra solo se muestra si la petición sigue pendiente tras SHOW_DELAY ms
 * y, una vez visible, permanece al menos MIN_VISIBLE ms.
 */

const SHOW_DELAY = 180;
const MIN_VISIBLE = 320;

let pending = 0;
let visible = false;
let showTimer = null;
let hideTimer = null;
let backgroundDepth = 0;

const listeners = new Set();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return visible;
}

export function getPendingCount() {
  return pending;
}

/**
 * Ejecuta una tarea async cuyas peticiones NO deben encender el indicador
 * global. Se usa para el sondeo periódico en segundo plano (cada 2 s), de modo
 * que la barra solo aparezca con acciones reales del usuario o cargas iniciales.
 */
export function runInBackground(task) {
  backgroundDepth += 1;
  let result;
  try {
    result = task();
  } catch (error) {
    backgroundDepth -= 1;
    throw error;
  }
  return Promise.resolve(result).finally(() => {
    backgroundDepth -= 1;
  });
}

export function isBackground() {
  return backgroundDepth > 0;
}

export function trackRequestStart() {
  pending += 1;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  if (pending === 1 && !visible && !showTimer) {
    showTimer = setTimeout(() => {
      showTimer = null;
      if (pending > 0) {
        visible = true;
        emit();
      }
    }, SHOW_DELAY);
  }
}

export function trackRequestEnd() {
  if (pending > 0) {
    pending -= 1;
  }

  if (pending > 0) {
    return;
  }

  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }

  if (visible && !hideTimer) {
    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (pending === 0) {
        visible = false;
        emit();
      }
    }, MIN_VISIBLE);
  }
}
