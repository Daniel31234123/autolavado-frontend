import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin", label: "Resumen", hint: "Vista general" },
  { to: "/admin/turnos", label: "Turnos", hint: "Fila en vivo" },
  { to: "/admin/bahias", label: "Bahías", hint: "Disponibilidad" },
  { to: "/admin/operarios", label: "Operarios", hint: "Equipo activo" },
  { to: "/admin/servicios", label: "Servicios", hint: "Catálogo" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark">AE</span>
        <div>
          <p className="sidebar__brand-name">AutoLavado Express Sincelejo</p>
          <p className="sidebar__brand-sub">Panel operativo</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
          >
            <span className="sidebar__link-label">{item.label}</span>
            <span className="sidebar__link-hint">{item.hint}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
