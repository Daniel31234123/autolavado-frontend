import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { serviciosApi } from "../../api/serviciosApi.js";
import { reservasApi } from "../../api/reservasApi.js";
import { vehiculosApi } from "../../api/vehiculosApi.js";

export function ReservaPage() {
  const navigate = useNavigate();

  // Estados del formulario
  const [placa, setPlaca] = useState("");
  const [sugerenciasPlaca, setSugerenciasPlaca] = useState([]);
  const [vehiculoExistente, setVehiculoExistente] = useState(false);
  const [tipoVehiculo, setTipoVehiculo] = useState("Auto");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [idServicio, setIdServicio] = useState("");
  
  // Fecha mínima: Hoy
  const hoyStr = new Date().toISOString().split("T")[0];
  const [fechaReserva, setFechaReserva] = useState(hoyStr);
  const [horaReserva, setHoraReserva] = useState("");

  // Catálogos y disponibilidad
  const [servicios, setServicios] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState(null);
  
  // Estados de carga y feedback
  const [cargando, setCargando] = useState(false);
  const [cargandoDispo, setCargandoDispo] = useState(false);
  const [error, setError] = useState("");
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  // Cargar catálogo de servicios al montar
  useEffect(() => {
    serviciosApi
      .obtenerTodos()
      .then((data) => {
        setServicios(data || []);
        if (data && data.length > 0) {
          setIdServicio(String(data[0].id));
        }
      })
      .catch((err) => {
        console.error("Error al cargar servicios:", err);
      });
  }, []);

  // Consultar disponibilidad al cambiar la fecha
  useEffect(() => {
    if (!fechaReserva) return;
    setCargandoDispo(true);
    reservasApi
      .consultarDisponibilidad(fechaReserva)
      .then((data) => {
        setDisponibilidad(data);
        // Si la hora seleccionada ya no está disponible, deseleccionarla
        if (horaReserva) {
          const franja = data.franjas?.find((f) => f.hora === horaReserva);
          if (!franja || !franja.disponible) {
            setHoraReserva("");
          }
        }
      })
      .catch((err) => {
        console.error("Error al consultar disponibilidad:", err);
      })
      .finally(() => {
        setCargandoDispo(false);
      });
  }, [fechaReserva]);

  // Autocompletado de placa al escribir
  const handlePlacaChange = async (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setPlaca(val);
    setError("");

    if (val.length >= 3) {
      try {
        const sugerencias = await vehiculosApi.buscar(val);
        setSugerenciasPlaca(sugerencias || []);
        
        // Si coincide exactamente con un vehículo existente
        const exacto = sugerencias?.find((s) => s.placa.toUpperCase() === val);
        if (exacto) {
          setTipoVehiculo(exacto.tipoVehiculo || "Auto");
          setTelefonoCliente(exacto.telefonoCliente || "");
          setVehiculoExistente(true);
        } else {
          setVehiculoExistente(false);
        }
      } catch {
        setSugerenciasPlaca([]);
      }
    } else {
      setSugerenciasPlaca([]);
      setVehiculoExistente(false);
    }
  };

  const seleccionarSugerencia = (sug) => {
    setPlaca(sug.placa);
    setTipoVehiculo(sug.tipoVehiculo || "Auto");
    setTelefonoCliente(sug.telefonoCliente || "");
    setVehiculoExistente(true);
    setSugerenciasPlaca([]);
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!placa || placa.length < 5) {
      setError("Por favor ingresa una placa válida (ej: QHT123).");
      return;
    }

    if (!idServicio) {
      setError("Por favor selecciona un servicio.");
      return;
    }

    if (!fechaReserva) {
      setError("Por favor selecciona una fecha.");
      return;
    }

    if (!horaReserva) {
      setError("Por favor selecciona una franja horaria con cupo disponible.");
      return;
    }

    if (!vehiculoExistente && !telefonoCliente) {
      setError("Por favor ingresa un número de teléfono de contacto.");
      return;
    }

    setCargando(true);

    try {
      const payload = {
        placa: placa.trim().toUpperCase(),
        tipo_vehiculo: tipoVehiculo,
        telefono_cliente: telefonoCliente.trim() || undefined,
        id_servicio: parseInt(idServicio, 10),
        fecha_reserva: fechaReserva,
        hora_reserva: horaReserva.length === 5 ? `${horaReserva}:00` : horaReserva,
      };

      const res = await reservasApi.crear(payload);
      setReservaConfirmada(res);
    } catch (err) {
      setError(err.message || "Error al procesar la reserva. Intenta con otro horario.");
    } finally {
      setCargando(false);
    }
  };

  const servicioSeleccionado = servicios.find((s) => String(s.id) === String(idServicio));

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
            to="/seguimiento"
            style={{
              color: "#f4f2ec",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            🔍 Rastrear Vehículo
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

      {/* Contenido Principal */}
      <main style={{ maxWidth: "860px", margin: "32px auto", padding: "0 16px" }}>
        {reservaConfirmada ? (
          /* Pantalla de Confirmación de Reserva */
          <div
            style={{
              background: "var(--color-surface)",
              border: "2px solid #22c55e",
              borderRadius: "16px",
              padding: "36px 28px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#15803d",
                display: "grid",
                placeItems: "center",
                fontSize: "36px",
                margin: "0 auto 20px",
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-ink)",
                fontSize: "1.8rem",
                marginBottom: "8px",
              }}
            >
              ¡Reserva Confirmada Exitosamente!
            </h1>
            <p style={{ color: "#64748b", marginBottom: "28px" }}>
              Tu turno ha sido apartado en nuestro sistema. Presenta tu código o placa al llegar al patio.
            </p>

            <div
              style={{
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "480px",
                margin: "0 auto 28px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Código de Cita:</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: "var(--color-primary-dark)",
                  }}
                >
                  {reservaConfirmada.codigo_reserva}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Vehículo (Placa):</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                  {reservaConfirmada.placa} ({reservaConfirmada.tipo_vehiculo || "Auto"})
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Servicio:</span>
                <span style={{ fontWeight: 600 }}>{reservaConfirmada.nombre_servicio}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Fecha Programada:</span>
                <span style={{ fontWeight: 600 }}>{reservaConfirmada.fecha_reserva}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Hora Asignada:</span>
                <span style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                  {reservaConfirmada.hora_reserva}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "12px" }}>
                <span style={{ fontWeight: 700 }}>Tarifa Estimada:</span>
                <span style={{ fontWeight: 800, color: "var(--color-primary-dark)", fontSize: "1.1rem" }}>
                  ${Number(reservaConfirmada.tarifa_estimada || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate(`/seguimiento?placa=${reservaConfirmada.placa}`)}
                style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                📡 Monitorear Estado en Vivo
              </button>

              <button
                type="button"
                onClick={() => {
                  setReservaConfirmada(null);
                  setPlaca("");
                  setHoraReserva("");
                }}
                style={{
                  background: "#e2e8f0",
                  color: "var(--color-ink)",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Agendar Otra Cita
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Reserva */
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-ink)",
                  fontSize: "1.75rem",
                  marginBottom: "8px",
                }}
              >
                Reserva tu Cita de Lavado
              </h1>
              <p style={{ color: "#64748b", margin: 0 }}>
                Selecciona el servicio y aparta un turno en la franja horaria de tu preferencia con garantía de cupo.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #f87171",
                  color: "#991b1b",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  fontSize: "0.95rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Sección 1: Datos del Vehículo */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ fontSize: "1.05rem", marginBottom: "16px", color: "var(--color-ink)" }}>
                  1. Información del Vehículo
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  {/* Placa con autocompletado */}
                  <div style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Placa del Vehículo *
                    </label>
                    <input
                      type="text"
                      value={placa}
                      onChange={handlePlacaChange}
                      placeholder="Ej: QHT123"
                      maxLength={6}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        textTransform: "uppercase",
                      }}
                    />

                    {/* Menú de autocompletado */}
                    {sugerenciasPlaca.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          background: "#fff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          maxHeight: "180px",
                          overflowY: "auto",
                          marginTop: "4px",
                        }}
                      >
                        {sugerenciasPlaca.map((sug) => (
                          <button
                            key={sug.placa}
                            type="button"
                            onClick={() => seleccionarSugerencia(sug)}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 14px",
                              border: "none",
                              borderBottom: "1px solid #f1f5f9",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                            }}
                            onMouseEnter={(e) => (e.target.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.target.style.background = "transparent")}
                          >
                            <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{sug.placa}</span>
                            <span style={{ color: "#64748b", marginLeft: "10px", fontSize: "0.8rem" }}>
                              ({sug.tipoVehiculo || "Auto"}) - {sug.telefonoCliente}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tipo de Vehículo */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Tipo de Automotor
                    </label>
                    <select
                      value={tipoVehiculo}
                      onChange={(e) => setTipoVehiculo(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        background: "#fff",
                      }}
                    >
                      <option value="Auto">Automóvil / Sedán</option>
                      <option value="Camioneta">Camioneta / SUV</option>
                      <option value="Moto">Motocicleta</option>
                    </select>
                  </div>

                  {/* Teléfono de contacto */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Teléfono de Contacto {!vehiculoExistente && "*"}
                    </label>
                    <input
                      type="tel"
                      value={telefonoCliente}
                      onChange={(e) => setTelefonoCliente(e.target.value)}
                      placeholder="Ej: 3001234567"
                      maxLength={10}
                      required={!vehiculoExistente}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Selección de Servicio */}
              <div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "14px", color: "var(--color-ink)" }}>
                  2. Selecciona el Tipo de Servicio
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {servicios.map((srv) => {
                    const esSeleccionado = String(srv.id) === String(idServicio);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setIdServicio(String(srv.id))}
                        style={{
                          border: esSeleccionado ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                          background: esSeleccionado ? "rgba(255, 105, 77, 0.04)" : "#fff",
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: esSeleccionado ? "0 4px 12px rgba(255, 105, 77, 0.15)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {srv.nombre.replace(/_/g, " ")}
                          </span>
                          <input
                            type="radio"
                            name="servicio"
                            checked={esSeleccionado}
                            onChange={() => setIdServicio(String(srv.id))}
                            style={{ accentColor: "var(--color-primary)" }}
                          />
                        </div>
                        <div style={{ color: "var(--color-primary-dark)", fontWeight: 800, fontSize: "1.15rem", marginBottom: "4px" }}>
                          ${Number(srv.precioBase || srv.tarifaBase || 0).toLocaleString("es-CO")}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                          ⏱️ ~{srv.tiempoEstimadoMin} min estimados
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sección 3: Fecha y Horario */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ fontSize: "1.05rem", marginBottom: "14px", color: "var(--color-ink)" }}>
                  3. Elige Fecha y Franja Horaria (RN-CL-01 & RN-CL-02)
                </h3>

                <div style={{ marginBottom: "18px", maxWidth: "260px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                    Fecha de Atención *
                  </label>
                  <input
                    type="date"
                    min={hoyStr}
                    value={fechaReserva}
                    onChange={(e) => setFechaReserva(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "10px" }}>
                    Horarios Disponibles para {fechaReserva}:
                    {cargandoDispo && <span style={{ marginLeft: "8px", color: "#64748b", fontWeight: 400 }}>Consultando cupos...</span>}
                  </label>

                  {disponibilidad?.franjas ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {disponibilidad.franjas.map((franja) => {
                        const seleccionada = horaReserva === franja.hora;
                        return (
                          <button
                            key={franja.hora}
                            type="button"
                            disabled={!franja.disponible}
                            onClick={() => setHoraReserva(franja.hora)}
                            style={{
                              padding: "10px 8px",
                              borderRadius: "8px",
                              border: seleccionada
                                ? "2px solid var(--color-primary)"
                                : franja.disponible
                                ? "1px solid #cbd5e1"
                                : "1px dashed #e2e8f0",
                              background: seleccionada
                                ? "var(--color-primary)"
                                : franja.disponible
                                ? "#fff"
                                : "#f1f5f9",
                              color: seleccionada
                                ? "#fff"
                                : franja.disponible
                                ? "var(--color-ink)"
                                : "#94a3b8",
                              fontWeight: 700,
                              cursor: franja.disponible ? "pointer" : "not-allowed",
                              textAlign: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ fontSize: "0.95rem" }}>{franja.hora}</div>
                            <div
                              style={{
                                fontSize: "0.68rem",
                                opacity: seleccionada ? 0.9 : 0.75,
                                marginTop: "2px",
                              }}
                            >
                              {franja.disponible ? `${franja.cupos_disponibles} cupos` : "Agotado"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Cargando franjas horarias...</div>
                  )}
                </div>
              </div>

              {/* Resumen y Botón de Confirmación */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "20px",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Total Estimado:</span>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-primary-dark)" }}>
                    ${Number(servicioSeleccionado?.precioBase || servicioSeleccionado?.tarifaBase || 0).toLocaleString("es-CO")}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando || !horaReserva}
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    cursor: cargando || !horaReserva ? "not-allowed" : "pointer",
                    opacity: cargando || !horaReserva ? 0.6 : 1,
                    boxShadow: "0 4px 14px rgba(255, 105, 77, 0.3)",
                  }}
                >
                  {cargando ? "Apartando Turno..." : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
