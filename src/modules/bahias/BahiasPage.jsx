import { BahiasGrid } from "./components/BahiasGrid.jsx";

export function BahiasPage() {
  return (
    <section className="page">
      <header className="page__header">
        <h1>Bahías</h1>
        <p>Estado de las bahías de lavado (disponible, ocupada, mantenimiento).</p>
      </header>
      <BahiasGrid />
    </section>
  );
}
