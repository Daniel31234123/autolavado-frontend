import { turnosApi } from "../../../api/turnosApi.js";

/**
 * Asigna una bahía recién liberada/disponible al turno EN_COLA más antiguo
 * que ya tenga operario asignado y todavía no tenga bahía (criterio FIFO).
 *
 * Se usa tanto al liberar recursos desde el tablero de turnos como al poner
 * manualmente una bahía en DISPONIBLE desde la página de Bahías.
 *
 * @param {number|string} idBahia
 * @returns {Promise<object|null>} el turno promovido, o null si no había cola.
 */
export async function asignarColaABahia(idBahia) {
  if (idBahia == null || idBahia === "") return null;

  const activos = await turnosApi.obtenerActivos();
  const enCola = (Array.isArray(activos) ? activos : [])
    .filter((t) => {
      const estado = String(t.estado_actual || t.estadoActual || "").toUpperCase();
      const sinBahia = (t.id_bahia ?? t.idBahia) == null;
      const conOperario = (t.id_operario ?? t.idOperario) != null;
      return estado === "EN_COLA" && sinBahia && conOperario;
    })
    .sort(
      (a, b) =>
        new Date(a.fecha_ingreso || a.fechaIngreso || 0) -
        new Date(b.fecha_ingreso || b.fechaIngreso || 0)
    );

  const siguiente = enCola[0];
  if (!siguiente) return null;

  await turnosApi.asignarBahia(siguiente.id, idBahia);
  return siguiente;
}
