import React, { useState, useEffect, useCallback, useRef } from "react";
import { reservasApi } from "../../api/reservasApi.js";
import { Loader } from "../../shared/components/Loader.jsx";
import { ErrorState } from "../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { StatusBadge } from "../../shared/components/StatusBadge.jsx";
import { ConfirmModal } from "../../shared/components/ConfirmModal.jsx";

const ESTADOS_RESERVA_INICIAR = ["CONFIRMADA", "PENDIENTE", "RESERVADA"];
const ESTADOS_RESERVA_CANCELABLES = ["CONFIRMADA", "PENDIENTE", "RESERVADA"];
const ESTADOS_RESERVA_NO_OPERATIVOS = ["CANCELADA", "CANCELADO", "EN_ATENCION"];

/**
 * Gestión administrativa de reservas (Incremento 2).
 * Consume GET /reservas, GET /reservas/{codigo}, PATCH /reservas/{id}/cancelar
 * y POST /reservas/{id}/iniciar-turno.
 */
export function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPlaca, setFiltroPlaca] = useState("");

  const [detalle, setDetalle] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [iniciandoReservaId, setIniciandoReservaId] = useState(null);
  const inicioEnCursoRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchReservas = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
      setIsError(false);
      setError(null);
    }
    try {
      const data = await reservasApi.obtenerTodas({
        fecha: filtroFecha || undefined,
        placa: filtroPlaca || undefined,
      });
      setReservas(
        (Array.isArray(data) ? data : []).filter(
          (reserva) => !ESTADOS_RESERVA_NO_OPERATIVOS.includes(String(reserva.estado || "").toUpperCase()),
        ),
      );
      setIsError(false);
      setError(null);
    } catch (err) {
      if (!silent) {
        setIsError(true);
        setError(err);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [filtroFecha, filtroPlaca]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const handleBuscarDetalle = async (codigo) => {
    setActionError(null);
    try {
      const data = await reservasApi.obtenerPorCodigo(codigo);
      setDetalle(data);
    } catch (err) {
      setActionError(err.message || "No se encontró la reserva indicada.");
    }
  };

  const handleCancelar = async () => {
    if (!cancelando) return;
    const estado = String(cancelando.estado || "").toUpperCase();
    if (!ESTADOS_RESERVA_CANCELABLES.includes(estado)) {
      setCancelando(null);
      setActionError("Esta reserva ya está en atención y no se puede cancelar.");
      return;
    }

    setIsProcessing(true);
    try {
      await reservasApi.cancelar(cancelando.id_reserva);
      setReservas((actuales) => actuales.filter((item) => item.id_reserva !== cancelando.id_reserva));
      await fetchReservas({ silent: true });
      showToast(`Reserva ${cancelando.codigo_reserva} cancelada.`);
      setCancelando(null);
    } catch (err) {
      setActionError(err.message || "Error al cancelar la reserva.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIniciarTurno = async (reserva) => {
    const estado = String(reserva.estado || "").toUpperCase();
    const puedeIniciar = ESTADOS_RESERVA_INICIAR.includes(estado);

    if (!puedeIniciar || inicioEnCursoRef.current === reserva.id_reserva) {
      return;
    }

    setActionError(null);
    inicioEnCursoRef.current = reserva.id_reserva;
    setIniciandoReservaId(reserva.id_reserva);
    try {
      const turno = await reservasApi.iniciarTurno(reserva.id_reserva);
      setReservas((actuales) =>
        actuales.map((item) =>
          item.id_reserva === reserva.id_reserva ? { ...item, estado: "EN_ATENCION" } : item,
        ),
      );
      await fetchReservas({ silent: true });
      showToast(`Turno ${turno.numero_turno} generado desde la reserva ${reserva.codigo_reserva}.`);
    } catch (err) {
      setActionError(err.message || "Error al iniciar el turno de la reserva.");
    }
    finally {
      inicioEnCursoRef.current = null;
      setIniciandoReservaId(null);
    }
  };

  return (
    <section className="page page--full">
      <header className="page__header">
        <h1>Gestión de Reservas</h1>
        <p>Consulta, filtra, cancela y convierte reservas del cliente en turnos de patio.</p>
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

      <div className="filters-bar">
        <div className="filters-bar__search" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            id="input-filtro-reserva-fecha"
          />
          <input
            type="search"
            placeholder="Filtrar por placa..."
            value={filtroPlaca}
            onChange={(e) => setFiltroPlaca(e.target.value.toUpperCase())}
            id="input-filtro-reserva-placa"
          />
          <button type="button" className="btn btn--secondary" onClick={() => fetchReservas()}>
            Filtrar
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setFiltroFecha("");
              setFiltroPlaca("");
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader label="Cargando reservas..." />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => fetchReservas()} />
      ) : reservas.length === 0 ? (
        <EmptyState
          title="No hay reservas pendientes"
          description="Las reservas en atención, canceladas o convertidas en turnos se consultan en sus módulos correspondientes."
        />
      ) : (
        <div className="table-container">
          <table className="data-table" id="tabla-reservas">
            <thead>
              <tr>
                <th>Código</th>
                <th>Placa</th>
                <th>Servicio</th>
                <th>Fecha / Hora</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id_reserva}>
                  <td className="font-mono">{r.codigo_reserva}</td>
                  <td className="font-mono">{r.placa}</td>
                  <td>{String(r.nombre_servicio || "").replace(/_/g, " ")}</td>
                  <td className="font-mono">
                    {r.fecha_reserva} {String(r.hora_reserva || "").slice(0, 5)}
                  </td>
                  <td>
                    <StatusBadge status={r.estado} />
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      {(() => {
                        const estado = String(r.estado || "").toUpperCase();
                        const puedeIniciar = ESTADOS_RESERVA_INICIAR.includes(estado);
                        const puedeCancelar = ESTADOS_RESERVA_CANCELABLES.includes(estado);
                        const iniciando = iniciandoReservaId === r.id_reserva;

                        return (
                          <>
                      <button
                        type="button"
                        className="btn btn--sm btn--secondary"
                        onClick={() => handleBuscarDetalle(r.codigo_reserva)}
                        id={`btn-detalle-reserva-${r.id_reserva}`}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--primary"
                        onClick={() => handleIniciarTurno(r)}
                        disabled={!puedeIniciar || iniciando}
                        title={
                          iniciando
                            ? "Generando turno..."
                            : puedeIniciar
                              ? "Convertir la reserva en un turno"
                              : "Esta reserva ya no puede iniciar otro turno"
                        }
                        id={`btn-iniciar-reserva-${r.id_reserva}`}
                      >
                        {iniciando ? "Iniciando..." : puedeIniciar ? "Iniciar turno" : "Turno iniciado"}
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger-outline"
                        onClick={() => setCancelando(r)}
                        disabled={!puedeCancelar}
                        title={
                          puedeCancelar
                            ? "Cancelar reserva"
                            : "No se puede cancelar una reserva que ya está en atención"
                        }
                        id={`btn-cancelar-reserva-${r.id_reserva}`}
                      >
                        Cancelar
                      </button>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setDetalle(null)}>
          <div className="modal modal--form" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Reserva {detalle.codigo_reserva}</h2>
              <button type="button" className="modal__close-btn" onClick={() => setDetalle(null)} aria-label="Cerrar">
                &times;
              </button>
            </div>
            <div className="modal__form">
              <p><strong>Placa:</strong> {detalle.placa} ({detalle.tipo_vehiculo || "Auto"})</p>
              <p><strong>Servicio:</strong> {String(detalle.nombre_servicio || "").replace(/_/g, " ")}</p>
              <p><strong>Fecha:</strong> {detalle.fecha_reserva} {String(detalle.hora_reserva || "").slice(0, 5)}</p>
              <p><strong>Teléfono:</strong> {detalle.telefono_cliente || "—"}</p>
              <p><strong>Estado:</strong> {detalle.estado}</p>
              <p><strong>Tarifa estimada:</strong> ${Number(detalle.tarifa_estimada || 0).toLocaleString("es-CO")}</p>
              <div className="modal__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setDetalle(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(cancelando)}
        title="¿Cancelar reserva?"
        message={`¿Seguro que deseas cancelar la reserva ${cancelando?.codigo_reserva} de la placa ${cancelando?.placa}?`}
        confirmText="Sí, cancelar"
        cancelText="Volver"
        danger
        isLoading={isProcessing}
        onConfirm={handleCancelar}
        onCancel={() => setCancelando(null)}
      />
    </section>
  );
}
