import { useBahiasDisponibles } from "../bahias/hooks/useBahiasDisponibles.js";
import { useOperariosActivos } from "../operarios/hooks/useOperariosActivos.js";
import { useOperariosInactivos } from "../operarios/hooks/useOperariosInactivos.js";
import { useOperariosOcupados } from "../operarios/hooks/useOperariosOcupados.js";
import { useServicios } from "../servicios/hooks/useServicios.js";
import { useTurnosActivos } from "../turnos/hooks/useTurnosActivos.js";
import { ESTADO_TURNO } from "../turnos/constants/turnoEnums.js";

export function DashboardPage() {
  const { turnos } = useTurnosActivos();
  const { bahias } = useBahiasDisponibles();
  const { operarios } = useOperariosActivos();
  const { operarios: operariosInactivos } = useOperariosInactivos();
  const { operarios: operariosOcupados } = useOperariosOcupados();
  const { servicios } = useServicios();
  const activeTurnos = turnos.filter((turno) => !["FINALIZADO", "CANCELADO"].includes(turno.estadoActual));
  const estados = Object.keys(ESTADO_TURNO).map((estado) => ({ estado, label: ESTADO_TURNO[estado].label, count: turnos.filter((turno) => turno.estadoActual === estado).length }));
  const maxEstado = Math.max(...estados.map((item) => item.count), 1);

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
      <div className="dashboard__grid">
        <section className="dashboard__panel dashboard__chart"><header><div><p className="eyebrow">Flujo de turnos</p><h2>Estado de la fila</h2></div><span className="panel__unit">TURNOS</span></header><div className="chart" aria-label="Turnos por estado">
          {estados.map((item) => <div className="chart__item" key={item.estado}><span className="chart__value">{item.count}</span><div className="chart__bar-wrap"><div className={`chart__bar chart__bar--${item.estado.toLowerCase()}`} style={{ height: `${Math.max((item.count / maxEstado) * 100, item.count ? 12 : 4)}%` }} /></div><span className="chart__label">{item.label}</span></div>)}
        </div></section>
        <section className="dashboard__panel dashboard__note"><p className="eyebrow">Operación</p><h2>Todo listo para el siguiente turno.</h2><p>Administra tu fila en vivo o revisa el estado de cada bahía desde el menú lateral.</p><span className="dashboard__mark">AE</span></section>
      </div>
    </section>
  );
}