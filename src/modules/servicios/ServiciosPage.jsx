import { ServiciosList } from "./components/ServiciosList.jsx";

export function ServiciosPage() {
  return (
    <section className="page">
      <header className="page__header">
        <h1>Servicios</h1>
        <p>Catálogo de servicios de lavado, con precio y tiempo estimado.</p>
      </header>
      <ServiciosList />
    </section>
  );
}
