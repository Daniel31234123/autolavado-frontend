import React, { useState, useEffect, useCallback } from "react";
import { usuariosService } from "./api/usuariosService.js";
import { operariosApi } from "../../api/operariosApi.js";
import { Loader } from "../../shared/components/Loader.jsx";
import { ErrorState } from "../../shared/components/ErrorState.jsx";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { StatusBadge } from "../../shared/components/StatusBadge.jsx";
import { ConfirmModal } from "../../shared/components/ConfirmModal.jsx";
import { UsuarioCreateModal } from "./components/UsuarioCreateModal.jsx";
import { UsuarioFormModal } from "./components/UsuarioFormModal.jsx";
import { CambiarContrasenaModal } from "./components/CambiarContrasenaModal.jsx";
import { EditarOperarioModal } from "../operarios/components/EditarOperarioModal.jsx";

const ESTADOS_OPERARIO = ["DISPONIBLE", "OCUPADO", "INACTIVO"];

function mapOperario(op) {
  return {
    key: `op-${op.id}`,
    uid: op.id,
    tipo: "OPERARIO",
    nombre: `${op.nombres || ""} ${op.apellidos || ""}`.trim() || op.nombre_usuario,
    nombre_usuario: op.nombre_usuario,
    activo: op.activo !== false,
    estado: String(op.estado || "").toUpperCase(),
    documento: op.documento,
    telefono: op.telefono,
    raw: op,
  };
}

function mapAdministrador(usuario) {
  return {
    key: `admin-${usuario.id}`,
    uid: usuario.id,
    tipo: "ADMINISTRADOR",
    nombre: usuario.nombre_usuario,
    nombre_usuario: usuario.nombre_usuario,
    activo: usuario.activo !== false,
    estado: null,
    documento: null,
    telefono: null,
    raw: usuario,
  };
}

function claveEstadoOperario(op) {
  if (op.activo === false) return "INACTIVO";
  const est = String(op.estado || "").toUpperCase();
  if (est === "OCUPADO") return "OCUPADO";
  if (est === "INACTIVO") return "INACTIVO";
  return "DISPONIBLE";
}

export function UsuariosPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const [filterRol, setFilterRol] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOperario, setEditingOperario] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [passwordAdmin, setPasswordAdmin] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [updatingEstadoKey, setUpdatingEstadoKey] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsuarios = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
      setIsError(false);
      setError(null);
    }
    try {
      const [admins, operarios] = await Promise.all([
        usuariosService.getAll(),
        operariosApi.obtenerTodos(),
      ]);
      const lista = [
        ...(Array.isArray(operarios) ? operarios.map(mapOperario) : []),
        ...(Array.isArray(admins) ? admins.map(mapAdministrador) : []),
      ];
      setItems(lista);
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
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleConfirmDesactivar = async () => {
    if (!deactivating) return;
    setIsDeactivating(true);
    try {
      if (deactivating.tipo === "ADMINISTRADOR") {
        await usuariosService.desactivar(deactivating.uid);
      } else {
        await operariosApi.desactivar(deactivating.uid);
      }
      await fetchUsuarios({ silent: true });
      showToast(`La cuenta ${deactivating.nombre_usuario || deactivating.nombre} fue desactivada.`);
      setDeactivating(null);
    } catch (err) {
      alert(err.message || "Error al desactivar el usuario.");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleCambiarEstado = async (item, estado) => {
    setUpdatingEstadoKey(item.key);
    try {
      await operariosApi.cambiarEstado(item.uid, estado);
      await fetchUsuarios({ silent: true });
      showToast(`Estado de ${item.nombre} actualizado a ${estado}.`);
    } catch (err) {
      alert(err.message || "Error al cambiar el estado del operario.");
    } finally {
      setUpdatingEstadoKey(null);
    }
  };

  const filtrados = items.filter((item) => {
    if (filterRol !== "TODOS" && item.tipo !== filterRol) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const nombre = String(item.nombre || "").toLowerCase();
      const usuario = String(item.nombre_usuario || "").toLowerCase();
      const doc = String(item.documento || "").toLowerCase();
      return nombre.includes(term) || usuario.includes(term) || doc.includes(term);
    }
    return true;
  });

  const conteoAdmins = items.filter((i) => i.tipo === "ADMINISTRADOR").length;
  const conteoOperarios = items.filter((i) => i.tipo === "OPERARIO").length;

  return (
    <section className="page page--full">
      <header className="page__header page__header--actions">
        <div>
          <h1>Usuarios</h1>
          <p>Gestión unificada de cuentas y fichas del personal (administradores y operarios).</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsCreateOpen(true)}
          id="btn-nuevo-usuario"
        >
          <span>Nuevo Usuario</span>
        </button>
      </header>

      {toastMessage && (
        <div className="alert alert--success alert--floating" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="filters-bar">
        <div className="filters-bar__pills">
          <button
            type="button"
            className={`filter-pill ${filterRol === "TODOS" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterRol("TODOS")}
          >
            Todos <span className="filter-pill__count">{items.length}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filterRol === "ADMINISTRADOR" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterRol("ADMINISTRADOR")}
          >
            Administradores <span className="filter-pill__count">{conteoAdmins}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filterRol === "OPERARIO" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterRol("OPERARIO")}
          >
            Operarios <span className="filter-pill__count">{conteoOperarios}</span>
          </button>
        </div>

        <div className="filters-bar__search">
          <input
            type="search"
            placeholder="Buscar por nombre, usuario o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-search-usuarios"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader label="Cargando usuarios..." />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => fetchUsuarios()} />
      ) : filtrados.length === 0 ? (
        <EmptyState
          title="No hay usuarios que coincidan"
          description="Crea un nuevo usuario o ajusta los filtros de búsqueda."
        />
      ) : (
        <div className="table-container">
          <table className="data-table" id="tabla-usuarios">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const esOperario = item.tipo === "OPERARIO";
                const inactivo = !item.activo;
                const estadoClave = esOperario ? claveEstadoOperario(item.raw) : null;

                return (
                  <tr key={item.key} className={inactivo ? "row--inactivo" : ""}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" aria-hidden="true">
                          {String(item.nombre || item.nombre_usuario || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{item.nombre}</div>
                          <div className="user-sub">
                            <code className="user-badge">@{item.nombre_usuario || "—"}</code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${esOperario ? "badge--warning" : "badge--neutral"}`}>
                        {esOperario ? "Operario" : "Administrador"}
                      </span>
                    </td>
                    <td className="font-mono">
                      {esOperario ? (
                        <span>
                          {item.documento || "—"}
                          <br />
                          <small>{item.telefono || ""}</small>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {inactivo ? (
                        <StatusBadge status="INACTIVO" />
                      ) : esOperario ? (
                        <StatusBadge status={estadoClave} />
                      ) : (
                        <StatusBadge status="ACTIVO" />
                      )}
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        {esOperario ? (
                          <>
                            <select
                              value={estadoClave}
                              onChange={(e) => handleCambiarEstado(item, e.target.value)}
                              disabled={updatingEstadoKey === item.key}
                              title="Cambiar estado laboral (RF-03)"
                              id={`select-estado-usuario-${item.uid}`}
                              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                            >
                              {ESTADOS_OPERARIO.map((estado) => (
                                <option key={estado} value={estado}>
                                  {estado}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="btn btn--sm btn--secondary"
                              onClick={() => setEditingOperario(item.raw)}
                              id={`btn-edit-operario-${item.uid}`}
                            >
                              Editar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn--sm btn--secondary"
                              onClick={() => setEditingAdmin(item.raw)}
                              id={`btn-edit-admin-${item.uid}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn--sm btn--secondary"
                              onClick={() => setPasswordAdmin(item.raw)}
                              id={`btn-password-admin-${item.uid}`}
                            >
                              Contraseña
                            </button>
                          </>
                        )}

                        {!inactivo && (
                          <button
                            type="button"
                            className="btn btn--sm btn--danger-outline"
                            onClick={() => setDeactivating(item)}
                            id={`btn-desactivar-usuario-${item.uid}`}
                          >
                            Desactivar
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
      )}

      {/* Alta unificada con selector de rol */}
      <UsuarioCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          fetchUsuarios({ silent: true });
          showToast("Usuario creado con éxito.");
        }}
      />

      <EditarOperarioModal
        isOpen={Boolean(editingOperario)}
        operario={editingOperario}
        onClose={() => setEditingOperario(null)}
        onUpdated={() => {
          fetchUsuarios({ silent: true });
          showToast("Operario actualizado.");
        }}
      />

      <UsuarioFormModal
        isOpen={Boolean(editingAdmin)}
        usuario={editingAdmin}
        onClose={() => setEditingAdmin(null)}
        onSaved={() => {
          fetchUsuarios({ silent: true });
          showToast("Administrador actualizado.");
        }}
      />

      <CambiarContrasenaModal
        isOpen={Boolean(passwordAdmin)}
        usuario={passwordAdmin}
        onClose={() => setPasswordAdmin(null)}
        onSaved={() => showToast("Contraseña actualizada con éxito.")}
      />

      <ConfirmModal
        isOpen={Boolean(deactivating)}
        title="¿Desactivar usuario?"
        message={`¿Seguro que deseas desactivar a ${deactivating?.nombre} (@${deactivating?.nombre_usuario})? No podrá iniciar sesión hasta ser reactivado.`}
        confirmText="Sí, desactivar"
        cancelText="Cancelar"
        danger
        isLoading={isDeactivating}
        onConfirm={handleConfirmDesactivar}
        onCancel={() => setDeactivating(null)}
      />
    </section>
  );
}
