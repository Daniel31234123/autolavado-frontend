import React, { useState, useEffect, useCallback } from "react";
import { operariosApi } from "../../api/operariosApi.js";
import { TablaOperarios } from "./components/TablaOperarios.jsx";
import { CrearOperarioModal } from "./components/CrearOperarioModal.jsx";
import { EditarOperarioModal } from "./components/EditarOperarioModal.jsx";
import { ConfirmModal } from "../../shared/components/ConfirmModal.jsx";

export function OperariosPage() {
  const [operarios, setOperarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("TODOS");

  // Modales
  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [editingOperario, setEditingOperario] = useState(null);
  const [deactivatingOperario, setDeactivatingOperario] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Mensaje flash de confirmación
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOperarios = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const data = await operariosApi.obtenerTodos();
      setOperarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperarios();
  }, [fetchOperarios]);

  const handleCreated = () => {
    fetchOperarios();
    showToast("Operario registrado exitosamente con estado Activo.");
  };

  const handleUpdated = () => {
    fetchOperarios();
    showToast("Datos del operario actualizados con éxito.");
  };

  const handleConfirmDesactivar = async () => {
    if (!deactivatingOperario) return;

    setIsDeactivating(true);
    try {
      await operariosApi.desactivar(deactivatingOperario.id);
      await fetchOperarios();
      showToast(
        `La cuenta de ${deactivatingOperario.nombres} ${deactivatingOperario.apellidos} fue desactivada.`
      );
      setDeactivatingOperario(null);
    } catch (err) {
      alert(err.message || "Error al desactivar el operario.");
    } finally {
      setIsDeactivating(false);
    }
  };

  // Helper para normalizar el estado del operario
  const getOperarioEstadoKey = (op) => {
    if (!op || op.activo === false) return "INACTIVO";
    const est = String(op.estado || "").toUpperCase();
    if (est === "INACTIVO") return "INACTIVO";
    if (est === "OCUPADO") return "OCUPADO";
    return "ACTIVO";
  };

  // Filtrado de operarios
  const operariosFiltrados = operarios.filter((op) => {
    const estado = getOperarioEstadoKey(op);

    if (filterState !== "TODOS" && estado !== filterState) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const fullName = `${op.nombres || ""} ${op.apellidos || ""}`.toLowerCase();
      const doc = String(op.documento || "").toLowerCase();
      const user = String(op.nombre_usuario || "").toLowerCase();
      return fullName.includes(term) || doc.includes(term) || user.includes(term);
    }

    return true;
  });

  const conteoActivos = operarios.filter((op) => getOperarioEstadoKey(op) === "ACTIVO").length;
  const conteoOcupados = operarios.filter((op) => getOperarioEstadoKey(op) === "OCUPADO").length;
  const conteoInactivos = operarios.filter((op) => getOperarioEstadoKey(op) === "INACTIVO").length;

  return (
    <section className="page page--full">
      <header className="page__header page__header--actions">
        <div>
          <h1>Administración de Operarios</h1>
          <p>Supervisa, registra y gestiona las cuentas del equipo de trabajo.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsCrearOpen(true)}
          id="btn-nuevo-operario"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Nuevo Operario</span>
        </button>
      </header>

      {toastMessage && (
        <div className="alert alert--success alert--floating" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de métricas y filtros */}
      <div className="filters-bar">
        <div className="filters-bar__pills">
          <button
            type="button"
            className={`filter-pill ${filterState === "TODOS" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterState("TODOS")}
          >
            Todos <span className="filter-pill__count">{operarios.length}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filterState === "ACTIVO" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterState("ACTIVO")}
          >
            Activos <span className="filter-pill__count">{conteoActivos}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filterState === "OCUPADO" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterState("OCUPADO")}
          >
            Ocupados <span className="filter-pill__count">{conteoOcupados}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filterState === "INACTIVO" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterState("INACTIVO")}
          >
            Inactivos <span className="filter-pill__count">{conteoInactivos}</span>
          </button>
        </div>

        <div className="filters-bar__search">
          <input
            type="search"
            placeholder="Buscar por nombre, documento o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-search-operarios"
          />
        </div>
      </div>

      <TablaOperarios
        operarios={operariosFiltrados}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={fetchOperarios}
        onEdit={(op) => setEditingOperario(op)}
        onDesactivar={(op) => setDeactivatingOperario(op)}
      />

      {/* Modal de Crear Operario (RFF-007) */}
      <CrearOperarioModal
        isOpen={isCrearOpen}
        onClose={() => setIsCrearOpen(false)}
        onCreated={handleCreated}
      />

      {/* Modal de Editar Operario (RFF-008) */}
      <EditarOperarioModal
        isOpen={Boolean(editingOperario)}
        operario={editingOperario}
        onClose={() => setEditingOperario(null)}
        onUpdated={handleUpdated}
      />

      {/* Diálogo de Confirmación para Desactivar (RFF-009) */}
      <ConfirmModal
        isOpen={Boolean(deactivatingOperario)}
        title="¿Desactivar cuenta de operario?"
        message={`¿Estás seguro de que deseas desactivar a ${deactivatingOperario?.nombres} ${deactivatingOperario?.apellidos} (@${deactivatingOperario?.nombre_usuario})? La cuenta pasará a estado Inactivo y no podrá iniciar sesión ni atender turnos.`}
        confirmText="Sí, desactivar"
        cancelText="Cancelar"
        danger={true}
        isLoading={isDeactivating}
        onConfirm={handleConfirmDesactivar}
        onCancel={() => setDeactivatingOperario(null)}
      />
    </section>
  );
}
