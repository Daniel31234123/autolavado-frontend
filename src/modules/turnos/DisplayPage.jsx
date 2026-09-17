import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { turnosApi } from "../../api/turnosApi.js";
import { Loader } from "../../shared/components/Loader.jsx";

/**
 * Pantalla pública de display para el patio (RF-06).
 * Consume GET /api/v1/turnos/display con sondeo corto.
 */
export function DisplayPage() {
  const [turnos, setTurnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisplay = useCallback(async () => {
    try {
      const data = await turnosApi.obtenerDisplay();
      setTurnos(Array.isArray(data) ? data : []);
    } catch {
      // El display es tolerante a fallos de red
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisplay();
    const interval = setInterval(fetchDisplay, 5000);
    return () => clearInterval(interval);
  }, [fetchDisplay]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-ink)", color: "#fff", padding: "32px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Tablero de Patio en Vivo</h1>
          <p style={{ opacity: 0.7, margin: "4px 0 0" }}>AutoLavado Express Sincelejo</p>
        </div>
        <Link to="/" style={{ color: "var(--color-amber)", fontWeight: 700, textDecoration: "none" }}>
          Volver al inicio
        </Link>
      </header>

      {isLoading ? (
        <Loader label="Cargando tablero público..." />
      ) : turnos.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No hay vehículos en patio en este momento.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {turnos.map((t) => (
            <article
              key={t.id_turno}
              style={{
                background: t.en_atencion ? "#0f7c86" : "rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>{t.numero_turno}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "10px",
                    background: t.en_atencion ? "#dcfce7" : "rgba(255,255,255,0.15)",
                    color: t.en_atencion ? "#15803d" : "#fff",
                  }}
                >
                  {t.en_atencion ? "EN ATENCIÓN" : "EN COLA"}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "1px" }}>
                {t.placa}
              </div>
              <div style={{ marginTop: "8px", opacity: 0.85, fontSize: "0.9rem" }}>
                {t.fase_titulo || t.estado_actual}
                {t.nombre_bahia ? ` · ${t.nombre_bahia}` : ""}
              </div>
              <div style={{ marginTop: "10px", height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${t.progreso_porcentaje ?? 0}%`,
                    background: "var(--color-amber)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
