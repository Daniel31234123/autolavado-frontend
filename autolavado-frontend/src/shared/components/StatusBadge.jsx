/**
 * Insignia de estado genérica. Cada módulo decide su propio texto/tono
 * (via las constantes de enums de ese módulo) y solo le pasa el resultado
 * a este componente puramente visual.
 *
 * @param {{ label: string, tone?: "neutral" | "positive" | "warning" | "danger" }} props
 */
export function StatusBadge({ label, tone = "neutral" }) {
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
