import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Loader } from "../../shared/components/Loader.jsx";
import { ErrorState } from "../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { useBahias } from "./hooks/useBahias.js";
import { bahiasService } from "./api/bahiasService.js";
import { asignarColaABahia } from "../turnos/utils/asignarColaABahia.js";
import { BahiaCard } from "./components/BahiaCard.jsx";
import { BahiaFormModal } from "./components/BahiaFormModal.jsx";

export function BahiasPage() {
  const { isAdmin } = useAuth();
  const { bahias, isLoading, isError, error, refetch } = useBahias();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [estadoError, setEstadoError] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaved = () => {
    refetch({ silent: true }).catch(() => {});
    showToast("Bahía creada con éxito.");
  };

  // El administrador solo puede alternar entre DISPONIBLE y MANTENIMIENTO.
  // OCUPADA lo controla el sistema según los turnos activos.
  const handleCambiarEstado = async (bahia, nuevoEstado) => {
    setUpdatingId(bahia.id);
    setEstadoError(null);
    try {
      await bahiasService.cambiarEstado(bahia.id, nuevoEstado);
      const nombre = bahia.nombre || bahia.nombreBahia || `Bahía #${bahia.id}`;

      if (nuevoEstado === "DISPONIBLE") {
        // Al liberar una bahía, el turno EN_COLA más antiguo (con operario y
        // sin bahía) pasa de inmediato a patio con esta bahía.
        let promovido = null;
        try {
          promovido = await asignarColaABahia(bahia.id);
        } catch {
          // Si la promoción falla, la bahía igual queda disponible.
        }
        const numero = promovido?.numero_turno || promovido?.numeroTurno;
        showToast(
          promovido
            ? `${nombre} disponible. Turno ${numero} asignado a patio.`
            : `${nombre} marcada como disponible.`
        );
      } else {
        showToast(`${nombre} puesta en mantenimiento.`);
      }

      refetch({ silent: true }).catch(() => {});
    } catch (err) {
      setEstadoError({
        id: bahia.id,
        message: err.message || "No se pudo cambiar el estado de la bahía.",
      });
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
            onClick={() => setIsFormOpen(true)}
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
              canManage={isAdmin}
              onChangeEstado={handleCambiarEstado}
              isUpdating={updatingId === bahia.id}
              error={estadoError?.id === bahia.id ? estadoError.message : null}
            />
          ))}
        </div>
      )}

      <BahiaFormModal
        isOpen={isFormOpen}
        bahia={null}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
      />
    </section>
  );
}
