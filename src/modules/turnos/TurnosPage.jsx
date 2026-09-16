import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { turnosApi } from "../../api/turnosApi.js";
import { serviciosApi } from "../../api/serviciosApi.js";
import { operariosApi } from "../../api/operariosApi.js";
import { bahiasApi } from "../../api/bahiasApi.js";
import { TurnosBoard } from "./components/TurnosBoard.jsx";
import { CrearTurnoForm } from "./components/CrearTurnoForm.jsx";
import { ComprobanteTurnoModal } from "./components/ComprobanteTurnoModal.jsx";

export function TurnosPage() {
  const { isAdmin } = useAuth();

  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [bahias, setBahias] = useState([]);

  const [isLoadingTurnos, setIsLoadingTurnos] = useState(true);
  const [isErrorTurnos, setIsErrorTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState(null);

  // Modal de Comprobante
  const [turnoCreado, setTurnoCreado] = useState(null);
  const [datosFormularioComprobante, setDatosFormularioComprobante] = useState(null);

  // Alerta de acción
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchCatalogos = useCallback(async () => {
    try {
      const [servData, opData, bahData] = await Promise.allSettled([
        serviciosApi.obtenerTodos(),
        operariosApi.obtenerActivos(),
        bahiasApi.obtenerDisponibles(),
      ]);

      if (servData.status === "fulfilled" && Array.isArray(servData.value)) {
        setServicios(servData.value);
      }
      if (opData.status === "fulfilled" && Array.isArray(opData.value)) {
        setOperarios(opData.value);
      }
      if (bahData.status === "fulfilled" && Array.isArray(bahData.value)) {
        setBahias(bahData.value);
      }
    } catch {
      // Los selectores mostrarán lo que haya disponible
    }
  }, []);

  const fetchTurnos = useCallback(async () => {
    setIsLoadingTurnos(true);
    setIsErrorTurnos(false);
    setErrorTurnos(null);
    try {
      const data = await turnosApi.obtenerActivos();
      setTurnos(Array.isArray(data) ? data : []);
    } catch (err) {
      setIsErrorTurnos(true);
      setErrorTurnos(err);
    } finally {
      setIsLoadingTurnos(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchTurnos();
    fetchCatalogos();
  }, [fetchTurnos, fetchCatalogos]);

  useEffect(() => {
    if (isAdmin) {
      refreshAll();
    }
  }, [isAdmin, refreshAll]);

  const handleCreated = (resultadoTurno, formData) => {
    setTurnoCreado(resultadoTurno);
    setDatosFormularioComprobante(formData);
    refreshAll();
    setActionMessage(`¡Turno ${resultadoTurno.numero_turno || resultadoTurno.numeroTurno} creado con éxito!`);
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleFinalizar = async (id) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await turnosApi.finalizar(id);
      setActionMessage("Turno finalizado con éxito. Bahía y operario liberados.");
      refreshAll();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || "Error al finalizar el turno.");
    }
  };

  const handleCancelar = async (id) => {
    setActionError(null);
    setActionMessage(null);
    if (!window.confirm("¿Seguro que deseas cancelar este turno? Se liberarán la bahía y el operario asignados.")) {
      return;
    }
    try {
      await turnosApi.cancelar(id);
      setActionMessage("Turno cancelado. Bahía y operario liberados.");
      refreshAll();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || "Error al cancelar el turno.");
    }
  };

  const handleActualizarFase = async (id, nuevaFase) => {
    setActionError(null);
    try {
      await turnosApi.actualizarFase(id, nuevaFase);
      setActionMessage(`Fase actualizada a ${nuevaFase}. Difundido en vivo a la pantalla del cliente.`);
      refreshAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionError(err.message || "Error al actualizar la fase del turno.");
    }
  };

  if (!isAdmin) {
    return (
      <section className="page page--empty" id="operario-empty-page" style={{ minHeight: "80vh" }}>
        {/* Pantalla vacia para el usuario operario */}
      </section>
    );
  }

  return (
    <section className="page page--split">
      <div className="page__main">
        <header className="page__header">
          <h1>Fila de Turnos</h1>
          <p>Supervisión en vivo de vehículos en espera y atención del autolavado.</p>
        </header>

        {actionMessage && (
          <div className="alert alert--success" role="status" style={{ marginBottom: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="alert alert--danger" role="alert" style={{ marginBottom: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{actionError}</span>
          </div>
        )}

        <TurnosBoard
          turnos={turnos}
          isLoading={isLoadingTurnos}
          isError={isErrorTurnos}
          error={errorTurnos}
          onRetry={refreshAll}
          onFinalizar={handleFinalizar}
          onCancelar={handleCancelar}
          onActualizarFase={handleActualizarFase}
        />
      </div>

      <aside className="page__aside">
        <CrearTurnoForm
          servicios={servicios}
          operarios={operarios}
          bahias={bahias}
          onCreated={handleCreated}
        />
      </aside>

      {/* Comprobante de Turno con número consecutivo (RFF-005) */}
      <ComprobanteTurnoModal
        turno={turnoCreado}
        datosFormulario={datosFormularioComprobante}
        onClose={() => {
          setTurnoCreado(null);
          setDatosFormularioComprobante(null);
        }}
      />
    </section>
  );
}
