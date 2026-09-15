import { BahiasGrid } from "./components/BahiasGrid.jsx";

export function BahiasPage() {
  return (
    <section className="page">
      <header className="page__header">
        <h1>Bahías</h1>
        <p>Disponibilidad de bahías de lavado en este momento.</p>
      </header>
      <BahiasGrid />
    </section>
  );
}
