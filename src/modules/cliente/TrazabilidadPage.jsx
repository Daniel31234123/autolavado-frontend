import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { suscribirTrazabilidad } from "../../api/realtime.js";
import { turnosApi } from "../../api/turnosApi.js";

export function TrazabilidadPage() {
  const { hash } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const placaParam = searchParams.get("placa") || "";

  const [criterio, setCriterio] = useState(hash || placaParam || "");
  const [trazabilidad, setTrazabilidad] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [enVivo, setEnVivo] = useState(false);

  // RF-CL-02: cuando aún no existe turno de patio, el backend devuelve la
  // reserva vigente del vehículo en lugar de un error.
  const esReserva = trazabilidad?.tipo_registro === "RESERVA";

  // Iniciar suscripción en tiempo real cuando hay un criterio activo
  useEffect(() => {
    const query = hash || searchParams.get("placa") || "";
    if (!query) return;

    setCriterio(query);
    setCargando(true);
    setError("");

    // Suscripción reactiva (SSE + Polling ultrarrápido)
    const cancelarSuscripcion = suscribirTrazabilidad(
      query,
      (data) => {
        setTrazabilidad(data);
        setCargando(false);
        setEnVivo(true);
        setError("");
      },
      (err) => {
        setError(err.message || "No se encontró ningún turno activo para este vehículo.");
        setCargando(false);
        setEnVivo(false);
      }
    );

    return () => {
      cancelarSuscripcion();
    };
  }, [hash, searchParams]);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (!criterio.trim()) return;
    setSearchParams({ placa: criterio.trim().toUpperCase() });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "60px" }}>
      {/* Header / Navbar público */}
      <header
        style={{
          background: "var(--color-ink)",
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                background: "var(--color-amber)",
                color: "var(--color-ink)",
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: "8px",
                fontFamily: "var(--font-display)",
              }}
            >
              AL
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>
                AutoLavado Express
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Sincelejo, Sucre</div>
            </div>
          </Link>
        </div>

        <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            to="/reservar"
            style={{
              color: "#f4f2ec",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Reservar cita
          </Link>
          <Link
            to="/login"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Acceso Staff
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "860px", margin: "32px auto", padding: "0 16px" }}>
        {/* Buscador de Placa / Token */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "24px 28px",
            marginBottom: "28px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontFamily: "var(--font-display)",
              marginBottom: "8px",
            }}
          >
            Consulta y Trazabilidad en Vivo
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "18px" }}>
            Ingresa la placa de tu vehículo o el código de seguimiento para ver el avance del trabajo reportado por el operario en patio.
          </p>

          <form onSubmit={handleBuscar} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={criterio}
              onChange={(e) => setCriterio(e.target.value.toUpperCase())}
              placeholder="Ej: QHT123 o código de seguimiento"
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "1.05rem",
              }}
            />
            <button
              type="submit"
              disabled={cargando}
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.95rem",
                boxShadow: "0 2px 8px rgba(255, 105, 77, 0.25)",
              }}
            >
              {cargando ? "Buscando..." : "Consultar Estado"}
            </button>
          </form>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #f87171",
              color: "#991b1b",
              padding: "16px 20px",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "0.95rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Vista de Trazabilidad Activa */}
        {trazabilidad && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Indicador de Transmisión en Vivo */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--color-ink)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: enVivo ? "#22c55e" : "#eab308",
                    display: "inline-block",
                    boxShadow: enVivo ? "0 0 10px #22c55e" : "none",
                    animation: enVivo ? "pulse 1.5s infinite" : "none",
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {esReserva
                    ? "RESERVA REGISTRADA"
                    : enVivo
                    ? "CONECTADO EN TIEMPO REAL"
                    : "CONECTANDO..."}
                </span>
              </div>
              <span style={{ fontSize: "0.8rem", opacity: 0.8, fontFamily: "var(--font-mono)" }}>
                {esReserva
                  ? `Reserva ${trazabilidad.codigo_reserva || trazabilidad.numero_turno}`
                  : `Turno #${trazabilidad.numero_turno}`}
              </span>
            </div>

            {/* ALERTA VERDE: Listo para Recoger (Caso de Prueba 2) */}
            {trazabilidad.esta_listo_para_recoger && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "2px solid #22c55e",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  boxShadow: "0 8px 24px rgba(34, 197, 94, 0.2)",
                  animation: "fadeIn 0.5s ease",
                }}
              >
                <div style={{ color: "#16a34a", marginBottom: "10px" }}>
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 17h14M6.5 17a1.5 1.5 0 1 0 3 0M14.5 17a1.5 1.5 0 1 0 3 0" />
                    <path d="M4 17v-4l2-5h12l2 5v4" />
                    <path d="M4 13h16" />
                  </svg>
                </div>
                <h2
                  style={{
                    color: "#15803d",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    marginBottom: "8px",
                  }}
                >
                  ¡Tu vehículo ya está listo!
                </h2>
                <p
                  style={{
                    color: "#166534",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {trazabilidad.mensaje_estado || "Puedes pasar a recogerlo al patio de entregas."}
                </p>
              </div>
            )}

            {/* AVISO: Reserva aún no convertida en turno de patio (RF-CL-02) */}
            {esReserva && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "2px solid #f59e0b",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 8px 24px rgba(245, 158, 11, 0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <h2
                    style={{
                      color: "#92400e",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5rem",
                      margin: 0,
                    }}
                  >
                    Tu reserva está registrada
                  </h2>
                </div>
                <p style={{ color: "#78350f", fontSize: "1rem", marginBottom: "18px" }}>
                  {trazabilidad.mensaje_estado ||
                    "Tu cita está apartada. El equipo de patio la convertirá en turno cuando llegues."}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <span style={{ color: "#92400e", fontSize: "0.8rem" }}>Código de Reserva:</span>
                    <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "1.15rem", color: "#92400e" }}>
                      {trazabilidad.codigo_reserva || trazabilidad.numero_turno}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#92400e", fontSize: "0.8rem" }}>Fecha Programada:</span>
                    <div style={{ fontWeight: 700 }}>{trazabilidad.fecha_reserva || "Por confirmar"}</div>
                  </div>
                  <div>
                    <span style={{ color: "#92400e", fontSize: "0.8rem" }}>Hora Asignada:</span>
                    <div style={{ fontWeight: 700 }}>
                      {trazabilidad.hora_reserva ? String(trazabilidad.hora_reserva).slice(0, 5) : "Por confirmar"}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#92400e", fontSize: "0.8rem" }}>Estado:</span>
                    <div style={{ fontWeight: 700 }}>{trazabilidad.estado_reserva || "CONFIRMADA"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta de Resumen del Vehículo y Operario */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Placa:</span>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-ink)",
                  }}
                >
                  {trazabilidad.placa}
                </div>
              </div>

              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Servicio Solicitado:</span>
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {trazabilidad.nombre_servicio?.replace(/_/g, " ")}
                </div>
              </div>

              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Operario Asignado:</span>
                <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-primary-dark)" }}>
                  {trazabilidad.nombre_operario || "En asignación"}
                </div>
              </div>

              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Tiempo Estimado:</span>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                  ~{trazabilidad.tiempo_estimado_min} min
                </div>
              </div>
            </div>

            {/* Barra de Progreso y Línea de Tiempo de Fases (solo para turnos) */}
            {!esReserva && (
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Progreso del Lavado</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: "var(--color-primary-dark)",
                  }}
                >
                  {trazabilidad.progreso_porcentaje}%
                </span>
              </div>

              {/* Barra de Progreso animada */}
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  background: "#e2e8f0",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "36px",
                }}
              >
                <div
                  style={{
                    width: `${trazabilidad.progreso_porcentaje}%`,
                    height: "100%",
                    background:
                      trazabilidad.progreso_porcentaje === 100
                        ? "#22c55e"
                        : "linear-gradient(90deg, #ff694d, #d9ef68)",
                    borderRadius: "6px",
                    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>

              {/* Línea de tiempo de hitos / fases */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {trazabilidad.fases?.map((fase, idx) => {
                  const esActiva = fase.en_curso;
                  const esCompletada = fase.completada;

                  return (
                    <div
                      key={fase.clave || idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                        position: "relative",
                      }}
                    >
                      {/* Nodo del hito */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: esCompletada
                            ? "#22c55e"
                            : esActiva
                            ? "var(--color-primary)"
                            : "#f1f5f9",
                          color: esCompletada || esActiva ? "#fff" : "#94a3b8",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          flexShrink: 0,
                          boxShadow: esActiva ? "0 0 12px rgba(255, 105, 77, 0.4)" : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {esCompletada ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Texto del hito */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: esActiva ? "var(--color-primary-dark)" : esCompletada ? "var(--color-ink)" : "#94a3b8",
                            marginBottom: "2px",
                          }}
                        >
                          {fase.titulo} {esActiva && <span style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>· En ejecución</span>}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          {fase.descripcion}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
