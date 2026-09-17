import { useBahiasDisponibles } from "../bahias/hooks/useBahiasDisponibles.js";
import { useOperariosActivos } from "../operarios/hooks/useOperariosActivos.js";
import { useOperariosInactivos } from "../operarios/hooks/useOperariosInactivos.js";
import { useOperariosOcupados } from "../operarios/hooks/useOperariosOcupados.js";
import { useServicios } from "../servicios/hooks/useServicios.js";
import { useTurnosActivos } from "../turnos/hooks/useTurnosActivos.js";
import { useHistorialTurnos } from "../turnos/hooks/useHistorialTurnos.js";

const FASES_EN_PROCESO = [
  "EN_PATIO",
  "ENJABONADO",
  "ENJUAGADO",
  "PULIDO",
  "DESINFECCION",
  "SECADO",
  "LISTO",
];

const estadoDe = (turno) => String(turno.estado_actual || turno.estadoActual || "").toUpperCase();

export function DashboardPage() {
  const { turnos } = useTurnosActivos();
  const { turnos: historial } = useHistorialTurnos();
  const { bahias } = useBahiasDisponibles();
  const { operarios } = useOperariosActivos();
  const { operarios: operariosInactivos } = useOperariosInactivos();
  const { operarios: operariosOcupados } = useOperariosOcupados();
  const { servicios } = useServicios();

  const activeTurnos = turnos.filter((turno) => !["FINALIZADO", "CANCELADO"].includes(estadoDe(turno)));

  // El gráfico usa el historial completo (incluye finalizados y cancelados).
  const estados = [
    { key: "en_cola", label: "En cola", count: historial.filter((t) => estadoDe(t) === "EN_COLA").length },
    {
      key: "en_servicio",
      label: "En proceso",
      count: historial.filter((t) => FASES_EN_PROCESO.includes(estadoDe(t))).length,
    },
    { key: "finalizado", label: "Finalizados", count: historial.filter((t) => estadoDe(t) === "FINALIZADO").length },
    { key: "cancelado", label: "Cancelados", count: historial.filter((t) => estadoDe(t) === "CANCELADO").length },
  ];
  const maxEstado = Math.max(...estados.map((item) => item.count), 1);

  // Resumen de servicios del día (todos los operarios)
  const hoy = new Date().toLocaleDateString("es-CO");
  const esDeHoy = (t) => {
    const fecha = t.fecha_ingreso || t.fechaIngreso;
    return fecha ? new Date(fecha).toLocaleDateString("es-CO") === hoy : false;
  };
  const turnosHoy = historial.filter(esDeHoy);
  const serviciosHoy = turnosHoy.filter((t) => estadoDe(t) === "FINALIZADO").length;
  const procesoHoy = turnosHoy.filter((t) => FASES_EN_PROCESO.includes(estadoDe(t))).length;
  const colaHoy = turnosHoy.filter((t) => estadoDe(t) === "EN_COLA").length;
  const canceladosHoy = turnosHoy.filter((t) => estadoDe(t) === "CANCELADO").length;
  const resumenDia = [
    { label: "Servicios hoy", value: serviciosHoy },
    { label: "En proceso", value: procesoHoy },
    { label: "En cola", value: colaHoy },
    { label: "Cancelados", value: canceladosHoy },
    { label: "Total del día", value: turnosHoy.length },
  ];

  return (
    <section className="page dashboard">
      <header className="page__header dashboard__header"><div><p className="eyebrow">Centro de control</p><h1>Resumen de hoy</h1><p>Una lectura rápida de la operación del autolavado.</p></div><span className="dashboard__date">EN VIVO</span></header>
      <div className="dashboard__stats">
        <article className="stat-card stat-card--accent"><span>Turnos activos</span><strong>{activeTurnos.length}</strong><small>En la fila actual</small></article>
        <article className="stat-card"><span>Bahías disponibles</span><strong>{bahias.length}</strong><small>Listas para recibir</small></article>
        <article className="stat-card"><span>Operarios activos</span><strong>{operarios.length}</strong><small>Equipo conectado</small></article>
        <article className="stat-card"><span>Operarios ocupados</span><strong>{operariosOcupados.length}</strong><small>En lavado</small></article>
        <article className="stat-card"><span>Operarios inactivos</span><strong>{operariosInactivos.length}</strong><small>Fuera de turno</small></article>
        <article className="stat-card"><span>Servicios</span><strong>{servicios.length}</strong><small>En el catálogo</small></article>
      </div>

      <section className="dashboard__panel" style={{ marginBottom: "20px" }}>
        <header><div><p className="eyebrow">Servicios del día</p><h2>Actividad de hoy</h2></div><span className="panel__unit">HOY</span></header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginTop: "16px" }}>
          {resumenDia.map((item) => (
            <div key={item.label} style={{ background: "#f8fafc", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "12px 14px" }}>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{item.label}</span>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "1.7rem", fontFamily: "var(--font-mono)" }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard__grid">
        <section className="dashboard__panel dashboard__chart"><header><div><p className="eyebrow">Flujo de turnos</p><h2>Estado de la fila</h2></div><span className="panel__unit">TURNOS</span></header><div className="chart" aria-label="Turnos por estado">
          {estados.map((item) => <div className="chart__item" key={item.key}><span className="chart__value">{item.count}</span><div className="chart__bar-wrap"><div className={`chart__bar chart__bar--${item.key}`} style={{ height: `${Math.max((item.count / maxEstado) * 100, item.count ? 12 : 4)}%` }} /></div><span className="chart__label">{item.label}</span></div>)}
        </div></section>
        <section className="dashboard__panel dashboard__note"><p className="eyebrow">Operación</p><h2>Todo listo para el siguiente turno.</h2><p>Administra tu fila en vivo o revisa el estado de cada bahía desde el menú lateral.</p><span className="dashboard__mark">AE</span></section>
      </div>
    </section>
  );
}
