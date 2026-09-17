import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Loader } from "../../shared/components/Loader.jsx";
import { ErrorState } from "../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { bahiasService } from "./api/bahiasService.js";
import { useBahias } from "./hooks/useBahias.js";
import { BahiaCard } from "./components/BahiaCard.jsx";
import { BahiaFormModal } from "./components/BahiaFormModal.jsx";

export function BahiasPage() {
  const { isAdmin } = useAuth();
  const { bahias, isLoading, isError, error, refetch } = useBahias();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBahia, setEditingBahia] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaved = () => {
    refetch({ silent: true }).catch(() => {});
    showToast(editingBahia ? "Bahía actualizada con éxito." : "Bahía creada con éxito.");
  };

  const handleChangeEstado = async (bahia, estado) => {
    setActionError(null);
    setUpdatingId(bahia.id);
    try {
      await bahiasService.cambiarEstado(bahia.id, estado);
      refetch({ silent: true }).catch(() => {});
      showToast(`Estado de la bahía actualizado a ${estado}.`);
    } catch (err) {
      setActionError(err.message || "Error al cambiar el estado de la bahía.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="page page--full">
      <header className="page__header page__header--actions">
        <div>
          <h1>Bahías de Lavado</h1>
          <p>Estado operativo de las bahías del patio (disponible, ocupada, mantenimiento).</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setEditingBahia(null);
              setIsFormOpen(true);
            }}
            id="btn-nueva-bahia"
          >
            <span>Nueva Bahía</span>
          </button>
        )}
      </header>

      {toastMessage && (
        <div className="alert alert--success alert--floating" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert--danger" role="alert" style={{ marginBottom: "16px" }}>
          <span>{actionError}</span>
        </div>
      )}

      {isLoading ? (
        <Loader label="Cargando bahías..." />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : bahias.length === 0 ? (
        <EmptyState
          title="No hay bahías registradas"
          description="Registra la primera bahía del patio para asignarla a los turnos."
        />
      ) : (
        <div className="grid grid--cards">
          {bahias.map((bahia) => (
            <BahiaCard
              key={bahia.id}
              bahia={bahia}
              onEdit={
                isAdmin
                  ? (b) => {
                      setEditingBahia(b);
                      setIsFormOpen(true);
                    }
                  : undefined
              }
              onChangeEstado={isAdmin ? handleChangeEstado : undefined}
              isUpdating={updatingId === bahia.id}
            />
          ))}
        </div>
      )}

      <BahiaFormModal
        isOpen={isFormOpen}
        bahia={editingBahia}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
