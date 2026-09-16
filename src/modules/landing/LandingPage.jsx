import { Link } from "react-router-dom";

const FEATURES = [
  { number: "01", title: "Reserva en Línea", text: "Aparta tu turno eligiendo fecha y hora disponible con cupo garantizado (RF-CL-01)." },
  { number: "02", title: "Trazabilidad en Vivo", text: "Monitorea la fase exacta de lavado reportada por el operario en tiempo real (RF-CL-02)." },
  { number: "03", title: "Operación Ágil", text: "Asignación automática, patio coordinado y entrega inmediata sin esperas." },
];

export function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing__nav">
        <Link className="landing__brand" to="/">
          <span className="landing__brand-mark">AE</span>
          <span>AutoLavado Express Sincelejo</span>
        </Link>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link className="btn btn--outline" to="/seguimiento" id="btn-landing-track">
            🔍 Rastrear Vehículo
          </Link>
          <Link className="btn btn--primary" to="/reservar" id="btn-landing-reservar">
            📅 Reservar Turno
          </Link>
          <Link className="btn btn--landing" to="/login" id="btn-landing-acceder">
            Staff <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
      <section className="landing__hero">
        <div className="landing__hero-copy">
          <p className="eyebrow">Sincelejo · Portal del Cliente & Monitoreo en Vivo</p>
          <h1>Tu autolavado, en movimiento.</h1>
          <p className="landing__intro">
            Reserva tu cita previa, elige tu servicio favorito y haz seguimiento reactivo en tiempo real al lavado de tu vehículo desde cualquier dispositivo.
          </p>
          <div style={{ display: "flex", gap: "14px", marginTop: "24px", flexWrap: "wrap" }}>
            <Link
              to="/reservar"
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                padding: "14px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 4px 14px rgba(255, 105, 77, 0.35)",
              }}
            >
              📅 Reservar Cita de Lavado
            </Link>
            <Link
              to="/seguimiento"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-ink)",
                border: "2px solid var(--color-ink)",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              🔍 Consultar Estado de Mi Auto
            </Link>
          </div>
        </div>
        <div className="landing__hero-art" aria-label="Ilustración de una operación de autolavado" role="img">
          <div className="landing__art-sun" /><div className="landing__art-road" />
          <div className="landing__art-card">
            <span className="landing__art-label" style={{ background: "#dcfce7", color: "#15803d" }}>EN VIVO 🔴</span>
            <strong>Fase: Enjabonado</strong>
            <span className="landing__art-line" />
            <small>Placa QHT123 · ~30 min</small>
          </div>
          <span className="landing__art-number">AE</span>
        </div>
      </section>
      <section className="landing__features" aria-label="Funciones principales">
        {FEATURES.map((feature) => (
          <article className="landing__feature" key={feature.number}>
            <span>{feature.number}</span>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}