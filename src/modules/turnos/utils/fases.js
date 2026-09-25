export const FASES_FALLBACK = ["POR_INICIAR", "ENJABONADO", "ENJUAGADO", "SECADO", "LISTO"];

export const ESTADOS_UBICACION = ["EN_COLA", "EN_PATIO"];

export function esEstadoFinal(estado) {
  const valor = String(estado || "").toUpperCase();
  return valor === "FINALIZADO" || valor === "CANCELADO";
}

/**
 * Calcula el estado visual y las reglas de habilitación de cada fase de un turno.
 *
 * El backend solo permite avanzar a la fase inmediatamente siguiente, y estados
 * como EN_PATIO / EN_COLA no forman parte del catálogo de fases del servicio.
 * Por eso, cuando el turno está en una ubicación, la siguiente fase válida es la
 * primera del catálogo (p. ej. DESINFECCION). Así se evita el error 409.
 */
export function calcularControlFases(fases, estado) {
  const claves = (Array.isArray(fases) && fases.length > 0 ? fases : FASES_FALLBACK).map((f) =>
    String(f).toUpperCase()
  );
  const estadoUpper = String(estado || "").toUpperCase();
  const indiceEstado = claves.indexOf(estadoUpper);
  const finalizado = esEstadoFinal(estadoUpper);

  let indiceSiguiente = -1;
  if (!finalizado) {
    if (indiceEstado >= 0 && indiceEstado < claves.length - 1) {
      // El estado actual sí pertenece al catálogo: solo la fase inmediatamente siguiente.
      indiceSiguiente = indiceEstado + 1;
    } else if (indiceEstado < 0) {
      // Estado de ubicación (EN_PATIO / EN_COLA) o desconocido que no está en el
      // catálogo del servicio: la fase permitida es la primera de la secuencia.
      indiceSiguiente = 0;
    }
  }

  return claves.map((clave, indice) => {
    const esUbicacion = ESTADOS_UBICACION.includes(clave);
    const esActiva = indice === indiceEstado;
    const completada = indiceEstado >= 0 && indice < indiceEstado;
    const esSiguiente = indice === indiceSiguiente;
    const habilitado = esSiguiente && !finalizado;

    return {
      clave,
      indice,
      esActiva,
      completada,
      esSiguiente,
      habilitado,
      esUbicacion,
      esFinal: clave === "LISTO" || clave === "LISTO_PARA_RECOGER",
    };
  });
}
