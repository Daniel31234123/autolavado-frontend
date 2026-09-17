import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Loader } from "../../shared/components/Loader.jsx";
import { ErrorState } from "../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { useServicios } from "./hooks/useServicios.js";
import { ServicioCard } from "./components/ServicioCard.jsx";
import { ServicioFormModal } from "./components/ServicioFormModal.jsx";

export function ServiciosPage() {
  const { isAdmin } = useAuth();
  const { servicios, isLoading, isError, error, refetch } = useServicios();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingServicio(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (servicio) => {
    setEditingServicio(servicio);
    setIsFormOpen(true);
  };

  const handleSaved = () => {
    refetch({ silent: true }).catch(() => {});
    showToast(editingServicio ? "Servicio actualizado con éxito." : "Servicio creado con éxito.");
  };

  return (
    <section className="page page--full">
      <header className="page__header page__header--actions">
        <div>
          <h1>Catálogo de Servicios</h1>
          <p>Servicios de lavado con precio, tiempo estimado y fases dinámicas (RF-04, RN-05).</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleOpenCreate}
            id="btn-nuevo-servicio"
          >
            <span>Nuevo Servicio</span>
          </button>
        )}
      </header>

      {toastMessage && (
        <div className="alert alert--success alert--floating" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {isLoading ? (
        <Loader label="Cargando catálogo de servicios..." />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : servicios.length === 0 ? (
        <EmptyState
          title="Aún no hay servicios registrados"
          description="Crea el primer servicio del catálogo para habilitar el registro de turnos."
        />
      ) : (
        <div className="grid grid--cards">
          {servicios.map((servicio) => (
            <ServicioCard
              key={servicio.id}
              servicio={servicio}
              onEdit={isAdmin ? handleOpenEdit : undefined}
            />
          ))}
        </div>
      )}

      <ServicioFormModal
        isOpen={isFormOpen}
        servicio={editingServicio}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
