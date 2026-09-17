import React from "react";
import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
} from "../../../shared/components/Skeleton.jsx";

function TablaOperariosSkeleton() {
  return (
    <div className="table-container" id="tabla-operarios-skeleton">
      <table className="data-table">
        <thead>
          <tr>
            <th>Operario</th>
            <th>Documento</th>
            <th>Usuario</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              <td>
                <div className="user-cell">
                  <SkeletonAvatar size="34px" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "130px" }}>
                    <SkeletonText width="110px" height="14px" />
                    <SkeletonText width="50px" height="10px" />
                  </div>
                </div>
              </td>
              <td>
                <SkeletonText width="80px" height="14px" />
              </td>
              <td>
                <SkeletonBadge width="70px" height="20px" />
              </td>
              <td>
                <SkeletonText width="90px" height="14px" />
              </td>
              <td>
                <SkeletonBadge width="64px" height="22px" />
              </td>
              <td className="text-right">
                <div className="table-actions">
                  <SkeletonButton width="65px" height="28px" />
                  <SkeletonButton width="75px" height="28px" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tabla de administración de operarios (RFF-006, RFF-009).
 * Muestra nombre, documento, usuario, estado y acciones de editar/desactivar.
 * NUNCA muestra hashes de contraseña ni información sensible.
 */
const ESTADOS_OPERARIO = ["DISPONIBLE", "OCUPADO", "INACTIVO"];

export function TablaOperarios({
  operarios = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  onEdit,
  onDesactivar,
  onCambiarEstado,
  updatingEstadoId = null,
}) {
  if (isLoading) {
    return <TablaOperariosSkeleton />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!operarios || operarios.length === 0) {
    return (
      <EmptyState
        title="No hay operarios registrados"
        description="Registra el primer operario del equipo utilizando el botón 'Nuevo operario'."
      />
    );
  }

  return (
    <div className="table-container">
      <table className="data-table" id="tabla-operarios">
        <thead>
          <tr>
            <th>Operario</th>
            <th>Documento</th>
            <th>Usuario</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operarios.map((op) => {
            const estadoUpper = String(op.estado || "").toUpperCase();
            const estadoDisplay =
              op.activo === false || estadoUpper === "INACTIVO"
                ? "Inactivo"
                : estadoUpper === "OCUPADO"
                ? "Ocupado"
                : "Disponible";
            const isInactivo = estadoDisplay === "Inactivo";

            return (
              <tr key={op.id} className={isInactivo ? "row--inactivo" : ""}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar" aria-hidden="true">
                      {op.nombres?.[0] || ""}
                      {op.apellidos?.[0] || ""}
                    </div>
                    <div>
                      <div className="user-name">
                        {op.nombres} {op.apellidos}
                      </div>
                      <div className="user-sub">ID: #{op.id}</div>
                    </div>
                  </div>
                </td>
                <td className="font-mono">{op.documento}</td>
                <td>
                  <code className="user-badge">@{op.nombre_usuario || "—"}</code>
                </td>
                <td className="font-mono">{op.telefono || "—"}</td>
                <td>
                  <StatusBadge status={estadoDisplay} />
                </td>
                <td className="text-right">
                  <div className="table-actions">
                    {onCambiarEstado && (
                      <select
                        value={isInactivo ? "INACTIVO" : estadoUpper === "OCUPADO" ? "OCUPADO" : "DISPONIBLE"}
                        onChange={(e) => onCambiarEstado(op, e.target.value)}
                        disabled={updatingEstadoId === op.id}
                        title="Cambiar estado laboral (RF-03)"
                        id={`select-estado-operario-${op.id}`}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                      >
                        {ESTADOS_OPERARIO.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      className="btn btn--sm btn--secondary"
                      onClick={() => onEdit(op)}
                      title="Editar datos básicos del operario"
                      id={`btn-edit-operario-${op.id}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>Editar</span>
                    </button>

                    {/* El botón Desactivar solo aparece para operarios activos u ocupados (RFF-009) */}
                    {!isInactivo && (
                      <button
                        type="button"
                        className="btn btn--sm btn--danger-outline"
                        onClick={() => onDesactivar(op)}
                        title="Desactivar cuenta del operario"
                        id={`btn-desactivar-operario-${op.id}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                        <span>Desactivar</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
