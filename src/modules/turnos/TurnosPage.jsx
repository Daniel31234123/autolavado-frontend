import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { turnosApi } from "../../api/turnosApi.js";
import { bahiasApi } from "../../api/bahiasApi.js";
import { useServicios } from "../servicios/hooks/useServicios.js";
import { TurnosBoard } from "./components/TurnosBoard.jsx";
import { CrearTurnoForm } from "./components/CrearTurnoForm.jsx";
import { ComprobanteTurnoModal } from "./components/ComprobanteTurnoModal.jsx";

export function TurnosPage() {
  const { user, isAdmin, isOperario } = useAuth();

  const [turnos, setTurnos] = useState([]);
  const { servicios } = useServicios();
  const [tablero, setTablero] = useState(null);
  const [bahiasDisponibles, setBahiasDisponibles] = useState([]);

  const [isLoadingTurnos, setIsLoadingTurnos] = useState(true);
  const [isErrorTurnos, setIsErrorTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState(null);

  // Modal de Comprobante
  const [turnoCreado, setTurnoCreado] = useState(null);
  const [datosFormularioComprobante, setDatosFormularioComprobante] = useState(null);

  // Modal de registro de ingreso (RF-01)
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Alerta de acción
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchCatalogos = useCallback(async () => {
    try {
      // El administrador gestiona todas las bahías; el operario solo ve las disponibles.
      const bahiasData = isAdmin
        ? await bahiasApi.obtenerTodas()
        : await bahiasApi.obtenerDisponibles();
      if (Array.isArray(bahiasData)) setBahiasDisponibles(bahiasData);
    } catch {
      // Ignorar error no crítico de catálogo
    }
  }, [isAdmin]);

  const cargaInicialRef = useRef(false);

  const fetchTurnos = useCallback(
    async ({ silent = false } = {}) => {
      // Solo se muestra el skeleton en la primera carga: los sondeos y
      // refrescos posteriores actualizan datos sin desmontar el tablero.
      const mostrarLoader = !silent && !cargaInicialRef.current;
      if (mostrarLoader) {
        setIsLoadingTurnos(true);
        setIsErrorTurnos(false);
        setErrorTurnos(null);
      }
      try {
        if (isAdmin) {
          // RF-05: tablero consolidado + listado de activos
          const [activosData, tableroData] = await Promise.all([
            turnosApi.obtenerActivos(),
            turnosApi.obtenerTablero(),
          ]);
          setTurnos(Array.isArray(activosData) ? activosData : []);
          setTablero(tableroData);
        } else {
          // RF-04: el operario solo visualiza sus propios turnos asignados
          const [miosData, mioData] = await Promise.all([
            turnosApi.obtenerMios(),
            turnosApi.obtenerMio().catch(() => null),
          ]);
          const lista = Array.isArray(miosData) ? [...miosData] : [];
          if (mioData && mioData.id != null && !lista.some((t) => t.id === mioData.id)) {
            lista.unshift(mioData);
          }
          setTurnos(lista);
          setTablero(null);
        }
        setIsErrorTurnos(false);
        setErrorTurnos(null);
        cargaInicialRef.current = true;
      } catch (err) {
        // En sondeos silenciosos conservamos la última vista conocida.
        if (mostrarLoader) {
          setIsErrorTurnos(true);
          setErrorTurnos(err);
        }
      } finally {
        if (mostrarLoader) setIsLoadingTurnos(false);
      }
    },
    [isAdmin]
  );

  const refreshAll = useCallback(() => {
    fetchTurnos();
    fetchCatalogos();
  }, [fetchTurnos, fetchCatalogos]);

  useEffect(() => {
    refreshAll();
    // RNF-01: sondeo de actualización cada 2 s para latencia < 2 s (sin parpadeo)
    const interval = setInterval(() => fetchTurnos({ silent: true }), 2000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchTurnos]);

  const handleCreated = (resultadoTurno, formData) => {
    setTurnoCreado(resultadoTurno);
    setDatosFormularioComprobante(formData);
    setIsCreateOpen(false);
    refreshAll();
    setActionMessage(`¡Turno ${resultadoTurno.numero_turno || resultadoTurno.numeroTurno} registrado con éxito!`);
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleActualizarFase = async (id, nuevaFase) => {
    setActionError(null);
    try {
      await turnosApi.actualizarFase(id, nuevaFase);
      setActionMessage(`Fase actualizada a ${nuevaFase.replace(/_/g, " ")}. Sincronizado en tiempo real.`);
      refreshAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionError(err.message || "Error al actualizar la fase del turno.");
    }
  };

  const handleFinalizar = async (id) => {
    setActionError(null);
    setActionMessage(null);
    const turno = turnos.find((item) => Number(item.id) === Number(id));
    const idBahia = turno?.id_bahia ?? turno?.idBahia;
    try {
      await turnosApi.finalizar(id);
      if (idBahia != null) {
        await bahiasApi.cambiarEstado(idBahia, "DISPONIBLE");
      }
      setActionMessage("Turno finalizado. La bahía quedó disponible para el próximo vehículo.");
      refreshAll();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || "Error al finalizar el turno.");
    }
  };

  const handleCancelar = async (id) => {
    setActionError(null);
    setActionMessage(null);
    if (!window.confirm("¿Seguro que deseas cancelar este turno? Se liberarán los recursos asignados.")) {
      return;
    }
    try {
      await turnosApi.cancelar(id);
      setActionMessage("Turno cancelado exitosamente.");
      refreshAll();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || "Error al cancelar el turno.");
    }
  };

  const handleAsignarBahia = async (id, idBahia) => {
    setActionError(null);
    try {
      await turnosApi.asignarBahia(id, Number(idBahia));
      setActionMessage("Bahía asignada al turno correctamente.");
      refreshAll();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionError(err.message || "Error al asignar la bahía.");
    }
  };

  // RN-05: las fases visibles se generan dinámicamente desde el catálogo del servicio contratado
  const FASES_FALLBACK = ["POR_INICIAR", "ENJABONADO", "ENJUAGADO", "SECADO", "LISTO"];
  const getFasesTurno = (turno) => {
    const idServicio = turno.id_servicio ?? turno.idServicio;
    const servicio = servicios.find((s) => Number(s.id) === Number(idServicio));
    return Array.isArray(servicio?.fases) && servicio.fases.length > 0
      ? servicio.fases
      : FASES_FALLBACK;
  };

  const labelFase = (fase) => String(fase).replace(/_/g, " ");

  // VISTA OPERARIO (RF-04: Panel Operativo del Lavador con Fases Dinámicas y Ergonomía Táctil)
  if (!isAdmin && isOperario) {
    const misTurnos = turnos.filter((t) => {
      const estado = String(t.estado_actual || t.estadoActual || "").toUpperCase();
      return estado !== "FINALIZADO" && estado !== "CANCELADO";
    });

    return (
      <section className="page" style={{ maxWidth: "780px", margin: "0 auto", padding: "20px 16px" }}>
        <header className="page__header" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h1 style={{ fontSize: "1.6rem" }}>Panel Operativo de Patio</h1>
              <p style={{ color: "#64748b" }}>Operario: <strong>{user}</strong> • Control de fases táctiles (RF-04)</p>
            </div>
            <button
              type="button"
              onClick={refreshAll}
              className="btn btn--sm btn--outline"
              style={{ minHeight: "44px" }}
            >
              Actualizar
            </button>
          </div>
        </header>

        {/* Bahías disponibles para el operario (información permitida) */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: "14px",
            padding: "16px 18px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "1rem" }}>Bahías disponibles</h2>
            <span className="badge badge--positive">{bahiasDisponibles.length}</span>
          </div>
          {bahiasDisponibles.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
              No hay bahías disponibles en este momento.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {bahiasDisponibles.map((b) => (
                <span key={b.id} className="badge badge--positive" style={{ fontSize: "0.82rem" }}>
                  {b.nombre || b.nombreBahia}
                </span>
              ))}
            </div>
          )}
        </div>

        {actionMessage && (
          <div className="alert alert--success" role="status" style={{ marginBottom: "16px" }}>
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="alert alert--danger" role="alert" style={{ marginBottom: "16px" }}>
            <span>{actionError}</span>
          </div>
        )}

        {misTurnos.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px dashed #cbd5e1",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15.5 14" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.3rem", color: "var(--color-ink)", marginBottom: "8px" }}>
              Sin vehículos asignados en este momento
            </h2>
            <p style={{ color: "#64748b", maxWidth: "420px", margin: "0 auto" }}>
              El sistema te asignará el próximo vehículo de la cola automáticamente (RF-02).
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {misTurnos.map((turno) => {
              const estado = (turno.estado_actual || turno.estadoActual || "EN_COLA").toUpperCase();
              const fasesTurno = getFasesTurno(turno);

              return (
                <article
                  key={turno.id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    border: "2px solid var(--color-border)",
                    padding: "24px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        fontSize: "1.3rem",
                        color: "var(--color-primary-dark)",
                      }}
                    >
                      {turno.numero_turno || turno.numeroTurno}
                    </span>
                    <span
                      style={{
                        background: estado === "LISTO" ? "#dcfce7" : "#e0f2fe",
                        color: estado === "LISTO" ? "#15803d" : "#0369a1",
                        fontWeight: 700,
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {estado.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "2rem",
                        fontWeight: 900,
                        letterSpacing: "1px",
                      }}
                    >
                      {turno.placa}
                    </span>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>
                      ({turno.tipo_vehiculo || turno.tipoVehiculo || "Auto"})
                    </span>
                  </div>

                  {/* Botones de Fases Táctiles (RNF-02: Min 48x48 px) */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: "10px" }}>
                      AVANCE DE FASES (PULSAR PARA REPORTAR EN VIVO):
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                      {fasesTurno.map((fase) => {
                        const clave = String(fase).toUpperCase();
                        const esActiva = estado === clave;
                        const esFinal = clave === "LISTO" || clave === "LISTO_PARA_RECOGER";
                        return (
                          <button
                            key={clave}
                            type="button"
                            onClick={() => handleActualizarFase(turno.id, clave)}
                            style={{
                              minHeight: "52px",
                              borderRadius: "10px",
                              border: esFinal
                                ? "2px solid #22c55e"
                                : esActiva
                                ? "2px solid var(--color-primary)"
                                : "1px solid #cbd5e1",
                              background: esFinal
                                ? esActiva
                                  ? "#22c55e"
                                  : "#dcfce7"
                                : esActiva
                                ? "var(--color-primary)"
                                : "#f8fafc",
                              color: esFinal ? (esActiva ? "#fff" : "#15803d") : esActiva ? "#fff" : "var(--color-ink)",
                              fontWeight: esFinal ? 800 : 700,
                              fontSize: "0.95rem",
                              cursor: "pointer",
                            }}
                          >
                            {labelFase(clave)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      color: "#64748b",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>
                      Bahía asignada:{" "}
                      <strong style={{ color: "var(--color-ink)" }}>
                        {turno.nombre_bahia || "Por asignar"}
                      </strong>
                    </span>
                    <span>Al marcar LISTO, el administrador realiza la entrega.</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  // VISTA ADMINISTRADOR (RF-05: Tablero de Supervisión Operativa en Vivo + Registro)
  return (
    <section className="page">
      <header className="page__header page__header--actions">
        <div>
          <h1>Turnos y Patio</h1>
          <p>Monitoreo en vivo de recepción y patio. Registra el ingreso desde el botón (RF-01, RF-05).</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsCreateOpen(true)}
          id="btn-abrir-crear-turno"
        >
          <span>Registrar Ingreso</span>
        </button>
      </header>

      {actionMessage && (
        <div className="alert alert--success" role="status" style={{ marginBottom: "16px" }}>
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert--danger" role="alert" style={{ marginBottom: "16px" }}>
          <span>{actionError}</span>
        </div>
      )}

      <TurnosBoard
        turnos={turnos}
        enAtencion={tablero?.en_atencion}
        enCola={tablero?.en_cola}
        isLoading={isLoadingTurnos}
        isError={isErrorTurnos}
        error={errorTurnos}
        onRetry={refreshAll}
        onFinalizar={handleFinalizar}
        onCancelar={handleCancelar}
        onActualizarFase={handleActualizarFase}
        onAsignarBahia={handleAsignarBahia}
        bahias={bahiasDisponibles}
        servicios={servicios}
      />

      {/* Formulario de registro en modal (RF-01) */}
      {isCreateOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Registrar ingreso de vehículo"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            style={{ width: "min(560px, 94vw)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <CrearTurnoForm
              servicios={servicios}
              onCreated={handleCreated}
              onClose={() => setIsCreateOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Comprobante de Turno con número consecutivo (RF-01, RF-02) */}
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
