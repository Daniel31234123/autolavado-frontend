import React from "react";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { Skeleton, SkeletonText, SkeletonBadge } from "../../../shared/components/Skeleton.jsx";
import { TurnoCard } from "./TurnoCard.jsx";

function TurnosBoardSkeleton() {
  return (
    <div className="board" id="turnos-board-skeleton">
      <div className="board__column">
        <header className="board__column-header">
          <span>En Recepción / Espera</span>
          <SkeletonBadge width="28px" height="20px" />
        </header>

        <div className="board__column-items">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card turno-card" style={{ gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SkeletonText width="60px" height="18px" />
                <SkeletonBadge width="60px" height="20px" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Skeleton width="85px" height="24px" borderRadius="4px" />
                <Skeleton width="50px" height="16px" borderRadius="4px" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <SkeletonText width="40px" height="10px" />
                  <SkeletonText width="70px" height="12px" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <SkeletonText width="40px" height="10px" />
                  <SkeletonText width="60px" height="12px" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <Skeleton width="100%" height="28px" borderRadius="6px" />
                <Skeleton width="100%" height="28px" borderRadius="6px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TurnosBoard({
  turnos = [],
  enAtencion,
  enCola,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  onCancelar,
  onActualizarFase,
  servicios = [],
}) {
  if (isLoading) {
    return <TurnosBoardSkeleton />;
  }

  if (isError) return <ErrorState error={error} onRetry={onRetry} />;

  const usaTablero = Array.isArray(enAtencion) || Array.isArray(enCola);

  // RF-05: cuando el backend entrega el tablero, se usan sus columnas exactas.
  const turnosCola = usaTablero
    ? enCola ?? []
    : turnos.filter((t) => {
        const estado = String(t.estado_actual || t.estadoActual || "").toUpperCase();
        return estado === "EN_COLA" || estado === "POR_INICIAR" || estado === "RECEPCION" || !estado;
      });

  const turnosPatio = usaTablero
    ? enAtencion ?? []
    : turnos.filter((t) => {
        const estado = String(t.estado_actual || t.estadoActual || "").toUpperCase();
        return estado !== "EN_COLA" && estado !== "POR_INICIAR" && estado !== "RECEPCION" && Boolean(estado);
      });

  if (!usaTablero && (!turnos || turnos.length === 0)) {
    return (
      <EmptyState
        title="No hay turnos activos en recepción"
        description="Utiliza el formulario para registrar el ingreso de un nuevo vehículo o reserva."
      />
    );
  }

  const renderCard = (turno) => (
    <TurnoCard
      key={turno.id}
      turno={turno}
      onCancelar={onCancelar}
      onActualizarFase={onActualizarFase}
      servicios={servicios}
    />
  );

  return (
    <div className="board">
      <div className="board__column">
        <header className="board__column-header">
          <span>En Recepción / Cola</span>
          <span className="board__column-count font-mono">{turnosCola.length}</span>
        </header>

        <div className="board__column-items">
          {turnosCola.length === 0 ? (
            <p className="board__column-empty">No hay vehículos en cola</p>
          ) : (
            turnosCola.map(renderCard)
          )}
        </div>
      </div>

      <div className="board__column">
        <header className="board__column-header">
          <span>En Patio / Lavado Activo</span>
          <span className="board__column-count font-mono">{turnosPatio.length}</span>
        </header>

        <div className="board__column-items">
          {turnosPatio.length === 0 ? (
            <p className="board__column-empty">No hay lavados en curso</p>
          ) : (
            turnosPatio.map(renderCard)
          )}
        </div>
      </div>
    </div>
  );
}
