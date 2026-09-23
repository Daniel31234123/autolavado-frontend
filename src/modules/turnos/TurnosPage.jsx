import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { turnosApi } from "../../api/turnosApi.js";
import { bahiasApi } from "../../api/bahiasApi.js";
import { operariosApi } from "../../api/operariosApi.js";
import { useServicios } from "../servicios/hooks/useServicios.js";
import { TurnosBoard } from "./components/TurnosBoard.jsx";
import { CrearTurnoForm } from "./components/CrearTurnoForm.jsx";
import { ComprobanteTurnoModal } from "./components/ComprobanteTurnoModal.jsx";
import { Loader } from "../../shared/components/Loader.jsx";
import { ErrorState } from "../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { StatusBadge } from "../../shared/components/StatusBadge.jsx";

export function TurnosPage() {
  const { user, isAdmin, isOperario } = useAuth();

  const [turnos, setTurnos] = useState([]);
  const { servicios } = useServicios();
  const [tablero, setTablero] = useState(null);
  // Bahías disponibles (información del operario; la asignación es automática).
  const [bahiasDisponibles, setBahiasDisponibles] = useState([]);
  const [errorCatalogo, setErrorCatalogo] = useState(null);

  const [isLoadingTurnos, setIsLoadingTurnos] = useState(true);
  const [isErrorTurnos, setIsErrorTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState(null);

  // Modal de Comprobante
  const [turnoCreado, setTurnoCreado] = useState(null);
  const [datosFormularioComprobante, setDatosFormularioComprobante] = useState(null);

  // Modal de registro de ingreso (RF-01)
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Vista del panel: tablero en vivo o historial
  const [vista, setVista] = useState("TABLERO");
  const [historial, setHistorial] = useState([]);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);
  const [filtroFechaHistorial, setFiltroFechaHistorial] = useState("");

  // Alerta de acción
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isLiberandoBahias, setIsLiberandoBahias] = useState(false);

  const fetchCatalogos = useCallback(async () => {
    // Las bahías disponibles se consultan siempre por su propio endpoint
    // (accesible para cualquier usuario autenticado), sin depender del rol.
    try {
      const data = await bahiasApi.obtenerDisponibles();
      if (Array.isArray(data)) {
        setBahiasDisponibles(data);
        setErrorCatalogo(null);
      }
    } catch (err) {
      setErrorCatalogo(err);
    }
  }, []);

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

  // El backend no libera la bahía al finalizar/cancelar un turno ni promueve la
  // cola al desocuparse una bahía. Este helper hace ambas cosas desde el cliente:
  //   1) marca la bahía liberada como DISPONIBLE,
  //   2) asigna esa misma bahía al turno EN_COLA más antiguo (FIFO) que ya
  //      tenga operario asignado, lo que lo hace pasar a EN_PATIO.
  const liberarBahiaYPromoverCola = useCallback(async (idBahia) => {
    if (idBahia == null || idBahia === "") return;
    try {
      await bahiasApi.cambiarEstado(idBahia, "DISPONIBLE");
    } catch {
      // La bahía pudo liberarse ya; continuamos con la promoción.
    }
    try {
      const activos = await turnosApi.obtenerActivos();
      const enCola = (Array.isArray(activos) ? activos : [])
        .filter((t) => {
          const estado = String(t.estado_actual || t.estadoActual || "").toUpperCase();
          const sinBahia = (t.id_bahia ?? t.idBahia) == null;
          const conOperario = (t.id_operario ?? t.idOperario) != null;
          return estado === "EN_COLA" && sinBahia && conOperario;
        })
        .sort(
          (a, b) =>
            new Date(a.fecha_ingreso || a.fechaIngreso || 0) -
            new Date(b.fecha_ingreso || b.fechaIngreso || 0)
        );
      const siguiente = enCola[0];
      if (siguiente) {
        await turnosApi.asignarBahia(siguiente.id, idBahia);
      }
    } catch {
      // Sin permisos o sin turnos en cola: no bloquea la acción principal.
    }
  }, []);

  // El backend deja operarios en OCUPADO cuando su turno termina y no hay cola,
  // o cuando el turno se cancela. Aquí se liberan los operarios activos que
  // están OCUPADO y no aparecen en ningún turno activo.
  const liberarOperariosHuerfanos = useCallback(async () => {
    try {
      const [operarios, activos] = await Promise.all([
        operariosApi.obtenerTodos(),
        turnosApi.obtenerActivos(),
      ]);
      const enUso = new Set(
        (Array.isArray(activos) ? activos : [])
          .map((t) => t.id_operario ?? t.idOperario)
          .filter((id) => id != null)
          .map(String)
      );
      const huerfanos = (Array.isArray(operarios) ? operarios : []).filter((o) => {
        const estado = String(o.estado || "").toUpperCase();
        return o.activo === true && estado === "OCUPADO" && !enUso.has(String(o.id));
      });
      for (const operario of huerfanos) {
        try {
          await operariosApi.cambiarEstado(operario.id, "DISPONIBLE");
        } catch {
          // Ignora operarios que no puedan actualizarse.
        }
      }
      return huerfanos.length;
    } catch {
      return 0;
    }
  }, []);

  const fetchHistorial = useCallback(async () => {
    setIsLoadingHistorial(true);
    setErrorHistorial(null);
    try {
      const data = await turnosApi.obtenerHistorial(filtroFechaHistorial || undefined);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorHistorial(err);
    } finally {
      setIsLoadingHistorial(false);
    }
  }, [filtroFechaHistorial]);

  // Refresca el historial al abrir la vista o al cambiar el filtro de fecha.
  useEffect(() => {
    if (vista === "HISTORIAL") fetchHistorial();
  }, [vista, fetchHistorial]);

  const abrirHistorial = () => setVista("HISTORIAL");

  useEffect(() => {
    refreshAll();
    // RNF-01: sondeo de actualización cada 2 s para latencia < 2 s (sin parpadeo)
    const interval = setInterval(() => fetchTurnos({ silent: true }), 2000);
    // Catálogos (bahías disponibles/disponibilidad) cada 5 s
    const catInterval = setInterval(fetchCatalogos, 5000);
    return () => {
      clearInterval(interval);
      clearInterval(catInterval);
    };
  }, [refreshAll, fetchTurnos, fetchCatalogos]);

  const handleCreated = (resultadoTurno, formData) => {
    setTurnoCreado(resultadoTurno);
    setDatosFormularioComprobante(formData);
    setIsCreateOpen(false);
    refreshAll();
    setActionMessage(`¡Turno ${resultadoTurno.numero_turno || resultadoTurno.numeroTurno} registrado con éxito!`);
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleActualizarFase = async (id, nuevaFase, idBahiaParam = null) => {
    setActionError(null);
    try {
      await turnosApi.actualizarFase(id, nuevaFase);
      const esFinal = String(nuevaFase).toUpperCase().includes("LISTO");
      // El backend marca el turno como FINALIZADO al llegar a LISTO, pero NO
      // libera la bahía; y al salir de /turnos/activos el administrador ya no
      // puede liberarla. Por eso se libera aquí de forma explícita.
      if (esFinal) {
        const turno = turnos.find((item) => Number(item.id) === Number(id));
        const idBahia = idBahiaParam ?? turno?.id_bahia ?? turno?.idBahia;
        await liberarBahiaYPromoverCola(idBahia);
        await liberarOperariosHuerfanos();
      }
      setActionMessage(
        esFinal
          ? "Turno finalizado: salió de patio y se liberaron el operario y la bahía."
          : `Fase actualizada a ${nuevaFase.replace(/_/g, " ")}. Sincronizado en tiempo real.`
      );
      refreshAll();
      setTimeout(() => setActionMessage(null), 4000);
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
      await liberarBahiaYPromoverCola(idBahia);
      await liberarOperariosHuerfanos();
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
    const turno = turnos.find((item) => Number(item.id) === Number(id));
    const idBahia = turno?.id_bahia ?? turno?.idBahia;
    try {
      await turnosApi.cancelar(id);
      // El backend tampoco libera la bahía ni el operario al cancelar.
      await liberarBahiaYPromoverCola(idBahia);
      await liberarOperariosHuerfanos();
      setActionMessage("Turno cancelado exitosamente.");
      refreshAll();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || "Error al cancelar el turno.");
    }
  };

  // Corrige bahías OCUPADA y operarios OCUPADO que quedaron de turnos ya
  // finalizados/cancelados (el backend no los libera). También promueve la cola.
  const handleLiberarRecursosHuerfanos = async () => {
    setActionError(null);
    setActionMessage(null);
    setIsLiberandoBahias(true);
    try {
      const [bahias, activos] = await Promise.all([
        bahiasApi.obtenerTodas(),
        turnosApi.obtenerActivos(),
      ]);
      const bahiasEnUso = new Set(
        (Array.isArray(activos) ? activos : [])
          .map((t) => t.id_bahia ?? t.idBahia)
          .filter((id) => id != null)
          .map(String)
      );
      const huerfanas = (Array.isArray(bahias) ? bahias : []).filter(
        (b) => String(b.estado).toUpperCase() === "OCUPADA" && !bahiasEnUso.has(String(b.id))
      );
      for (const bahia of huerfanas) {
        await liberarBahiaYPromoverCola(bahia.id);
      }
      const operariosLiberados = await liberarOperariosHuerfanos();
      setActionMessage(
        huerfanas.length > 0 || operariosLiberados > 0
          ? `Se liberaron ${huerfanas.length} bahía(s) y ${operariosLiberados} operario(s) sin turno activo.`
          : "No hay bahías ni operarios ocupados sin turno activo."
      );
      refreshAll();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      setActionError(err.message || "No se pudieron liberar los recursos.");
    } finally {
      setIsLiberandoBahias(false);
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
    const estadoDe = (t) => String(t.estado_actual || t.estadoActual || "").toUpperCase();
    const misTurnos = turnos.filter((t) => {
      const estado = estadoDe(t);
      return estado !== "FINALIZADO" && estado !== "CANCELADO";
    });

    // Resumen e historial de servicios del operario (RF-04)
    const hoy = new Date().toLocaleDateString("es-CO");
    const esDeHoy = (t) => {
      const fecha = t.fecha_ingreso || t.fechaIngreso;
      return fecha ? new Date(fecha).toLocaleDateString("es-CO") === hoy : false;
    };
    const finalizados = turnos.filter((t) => estadoDe(t) === "FINALIZADO");
    const completadosHoy = finalizados.filter(esDeHoy).length;
    const enProceso = turnos.filter((t) => !["FINALIZADO", "CANCELADO"].includes(estadoDe(t))).length;
    const historialServicios = [...turnos]
      .filter((t) => ["FINALIZADO", "CANCELADO"].includes(estadoDe(t)))
      .sort(
        (a, b) =>
          new Date(b.fecha_ingreso || b.fechaIngreso || 0) -
          new Date(a.fecha_ingreso || a.fechaIngreso || 0)
      );

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

        {/* Resumen de servicios del operario */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "14px 16px" }}>
            <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              Servicios hoy
            </span>
            <strong style={{ display: "block", marginTop: "6px", fontSize: "1.8rem", fontFamily: "var(--font-mono)" }}>
              {completadosHoy}
            </strong>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "14px 16px" }}>
            <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              En proceso
            </span>
            <strong style={{ display: "block", marginTop: "6px", fontSize: "1.8rem", fontFamily: "var(--font-mono)" }}>
              {enProceso}
            </strong>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "14px 16px" }}>
            <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              Total completados
            </span>
            <strong style={{ display: "block", marginTop: "6px", fontSize: "1.8rem", fontFamily: "var(--font-mono)" }}>
              {finalizados.length}
            </strong>
          </div>
        </div>

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
            <p style={{ color: errorCatalogo ? "#b94a62" : "#64748b", margin: 0, fontSize: "0.9rem" }}>
              {errorCatalogo
                ? `No se pudieron cargar las bahías: ${errorCatalogo.message || "error de conexión"}.`
                : "No hay bahías disponibles en este momento."}
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
              const indiceActualTurno = fasesTurno.findIndex((f) => String(f).toUpperCase() === estado);
              const idBahiaTurno = turno.id_bahia ?? turno.idBahia ?? null;
              const tieneBahiaTurno = idBahiaTurno !== null && idBahiaTurno !== undefined && idBahiaTurno !== "";

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

                  {!tieneBahiaTurno ? (
                    /* En cola: la bahía se asigna automáticamente al liberarse una */
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 20px" }}>
                      En cola: la bahía se asigna automáticamente cuando se libera una.
                    </p>
                  ) : (
                    /* Botones de Fases Táctiles (RNF-02: Min 48x48 px) */
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: "10px" }}>
                        AVANCE DE FASES (PULSAR PARA REPORTAR EN VIVO):
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                        {fasesTurno.map((fase, idx) => {
                          const clave = String(fase).toUpperCase();
                          const esActiva = indiceActualTurno === idx;
                          const completada = indiceActualTurno > idx;
                          const esUbicacion = clave === "EN_COLA" || clave === "EN_PATIO";
                          const esFinal = clave === "LISTO" || clave === "LISTO_PARA_RECOGER";
                          const deshabilitado = esActiva || completada || esUbicacion;

                          return (
                            <button
                              key={clave}
                              type="button"
                              disabled={deshabilitado}
                              onClick={() => handleActualizarFase(turno.id, clave, idBahiaTurno)}
                              style={{
                                minHeight: "52px",
                                borderRadius: "10px",
                                border: esActiva
                                  ? `2px solid ${esFinal ? "#22c55e" : "var(--color-primary)"}`
                                  : completada
                                  ? "2px solid #86efac"
                                  : "1px solid #cbd5e1",
                                background: esActiva
                                  ? esFinal
                                    ? "#22c55e"
                                    : "var(--color-primary)"
                                  : completada
                                  ? "#dcfce7"
                                  : "#f8fafc",
                                color: esActiva ? "#fff" : completada ? "#15803d" : esUbicacion ? "#94a3b8" : "var(--color-ink)",
                                fontWeight: esActiva || esFinal ? 800 : 700,
                                fontSize: "0.95rem",
                                cursor: deshabilitado ? "not-allowed" : "pointer",
                              }}
                            >
                              {labelFase(clave)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

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

        {/* Historial de servicios del operario */}
        <div
          style={{
            marginTop: "24px",
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "12px" }}>Historial de servicios</h2>
          {historialServicios.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
              Aún no has completado servicios.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table" id="tabla-historial-operario">
                <thead>
                  <tr>
                    <th>Turno</th>
                    <th>Placa</th>
                    <th>Servicio</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historialServicios.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono">{t.numero_turno || t.numeroTurno}</td>
                      <td className="font-mono">{t.placa}</td>
                      <td>{String(t.nombre_servicio || "").replace(/_/g, " ")}</td>
                      <td>
                        <StatusBadge status={t.estado_actual || t.estadoActual} />
                      </td>
                      <td className="font-mono">
                        {t.fecha_ingreso || t.fechaIngreso
                          ? new Date(t.fecha_ingreso || t.fechaIngreso).toLocaleString("es-CO", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleLiberarRecursosHuerfanos}
            disabled={isLiberandoBahias}
            id="btn-liberar-recursos-huerfanos"
            title="Libera bahías y operarios ocupados que ya no tienen un turno activo"
          >
            <span>{isLiberandoBahias ? "Liberando..." : "Liberar recursos sin turno"}</span>
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setIsCreateOpen(true)}
            id="btn-abrir-crear-turno"
          >
            <span>Registrar Ingreso</span>
          </button>
        </div>
      </header>

      {/* Selector de vista: tablero en vivo / historial */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          type="button"
          className={`btn btn--sm ${vista === "TABLERO" ? "btn--primary" : "btn--secondary"}`}
          onClick={() => setVista("TABLERO")}
          id="tab-tablero"
        >
          Tablero en vivo
        </button>
        <button
          type="button"
          className={`btn btn--sm ${vista === "HISTORIAL" ? "btn--primary" : "btn--secondary"}`}
          onClick={abrirHistorial}
          id="tab-historial"
        >
          Historial
        </button>
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

      {vista === "TABLERO" ? (
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
          servicios={servicios}
        />
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
            <label htmlFor="input-filtro-historial-fecha" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Filtrar por fecha:
            </label>
            <input
              type="date"
              id="input-filtro-historial-fecha"
              value={filtroFechaHistorial}
              onChange={(e) => setFiltroFechaHistorial(e.target.value)}
            />
            {filtroFechaHistorial && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => setFiltroFechaHistorial("")}
              >
                Limpiar filtro
              </button>
            )}
          </div>

          {isLoadingHistorial ? (
            <Loader label="Cargando historial de turnos..." />
          ) : errorHistorial ? (
            <ErrorState error={errorHistorial} onRetry={fetchHistorial} />
          ) : historial.length === 0 ? (
            <EmptyState
              title="Sin turnos en el historial"
              description={
                filtroFechaHistorial
                  ? "No hay turnos registrados para la fecha seleccionada."
                  : "Aquí aparecerán todos los turnos registrados, activos y cerrados."
              }
            />
          ) : (
            <div className="table-container">
              <table className="data-table" id="tabla-historial-turnos">
                <thead>
                  <tr>
                    <th>Turno</th>
                    <th>Placa</th>
                    <th>Servicio</th>
                    <th>Operario</th>
                    <th>Bahía</th>
                    <th>Estado</th>
                    <th>Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono">{t.numero_turno}</td>
                      <td className="font-mono">{t.placa}</td>
                      <td>{String(t.nombre_servicio || "").replace(/_/g, " ")}</td>
                      <td>{t.nombre_operario || "—"}</td>
                      <td>{t.nombre_bahia || "—"}</td>
                      <td>
                        <StatusBadge status={t.estado_actual} />
                      </td>
                      <td className="font-mono">
                        {t.fecha_ingreso
                          ? new Date(t.fecha_ingreso).toLocaleString("es-CO", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

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
