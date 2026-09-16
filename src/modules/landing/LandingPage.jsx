import { Link } from "react-router-dom";

const FEATURES = [
  { number: "01", title: "Turnos claros", text: "Organiza la fila y conoce el estado de cada vehículo de un vistazo." },
  { number: "02", title: "Bahías visibles", text: "Consulta la capacidad del autolavado y detecta mantenimientos a tiempo." },
  { number: "03", title: "Equipo conectado", text: "Mantén servicios y operarios coordinados desde un mismo lugar." },
];

export function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing__nav">
        <Link className="landing__brand" to="/"><span className="landing__brand-mark">AE</span><span>AutoLavado Express Sincelejo</span></Link>
        <Link className="btn btn--landing" to="/login" id="btn-landing-acceder">Acceder <span aria-hidden="true">→</span></Link>
      </nav>
      <section className="landing__hero">
        <div className="landing__hero-copy">
          <p className="eyebrow">Sincelejo · Operación inteligente</p>
          <h1>Tu autolavado, en movimiento.</h1>
          <p className="landing__intro">AutoLavado Express Sincelejo reúne turnos, bahías, servicios y equipo en un solo lugar para que cada vehículo avance sin pausas.</p>
        </div>
        <div className="landing__hero-art" aria-label="Ilustración de una operación de autolavado" role="img">
          <div className="landing__art-sun" /><div className="landing__art-road" />
          <div className="landing__art-card"><span className="landing__art-label">EN SERVICIO</span><strong>Bahía 02</strong><span className="landing__art-line" /><small>Turno T-014 · SUV</small></div>
          <span className="landing__art-number">AE</span>
        </div>
      </section>
      <section className="landing__features" aria-label="Funciones principales">
        {FEATURES.map((feature) => <article className="landing__feature" key={feature.number}><span>{feature.number}</span><h2>{feature.title}</h2><p>{feature.text}</p></article>)}
      </section>
    </main>
  );
}