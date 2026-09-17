import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function LoginPage() {
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está autenticado, redirigir según su rol (RFF-001 / RFF-003)
  if (!isLoading && isAuthenticated) {
    const destino = isAdmin ? "/dashboard" : "/turnos";
    return <Navigate to={destino} replace />;
  }

  function handleQuickFill(user, pass) {
    setNombreUsuario(user);
    setContrasena(pass);
    setValidationError(null);
    setErrorMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    const userClean = nombreUsuario.trim();
    if (!userClean || !contrasena) {
      setValidationError("Por favor completa el nombre de usuario y la contraseña.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(userClean, contrasena);

      // Redirección según rol (RFF-001)
      const roleUpper = String(result.role).toUpperCase();
      if (roleUpper === "ADMINISTRADOR") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/turnos", { replace: true });
      }
    } catch (err) {
      // Login fallido -> mensaje "Usuario o contraseña incorrectos" o detalle del backend (RFF-001)
      if (err.status === 401) {
        setErrorMessage("Usuario o contraseña incorrectos.");
      } else {
        setErrorMessage(err.message || "Usuario o contraseña incorrectos.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-layout">
      {/* --- Panel Izquierdo: Hero & Branding --- */}
      <aside className="login-hero">
        <div className="login-hero__top">
          <Link to="/" className="login-hero__back" title="Regresar a la página principal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Volver al inicio</span>
          </Link>
          <div className="login-hero__status">
            <span className="status-dot"></span>
            <span>Sistema en línea</span>
          </div>
        </div>

        <div className="login-hero__body">
          <div className="login-hero__brand">
            <div className="login-hero__logo">AE</div>
            <div className="login-hero__brand-text">
              <h2>AutoLavado Express</h2>
              <span>Sincelejo · Operación Inteligente</span>
            </div>
          </div>

          <h1 className="login-hero__title">
            Control integral de <span>turnos y bahías</span>.
          </h1>
          <p className="login-hero__desc">
            Plataforma operativa diseñada para acelerar la recepción de vehículos, balancear la carga de trabajo de los operarios y asegurar el flujo continuo de lavado.
          </p>

          <div className="login-hero__features">
            <div className="login-hero__feature-item">
              <div className="feature-item__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className="feature-item__text">
                <h4>Recepción & Comprobantes QR</h4>
                <p>Generación de turnos consecutivos con comprobante digital imprimible.</p>
              </div>
            </div>

            <div className="login-hero__feature-item">
              <div className="feature-item__icon feature-item__icon--amber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="feature-item__text">
                <h4>Administración de Operarios</h4>
                <p>Gestión de personal, control de disponibilidad y asignación eficiente.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-hero__footer">
          <span>AutoLavado Express Sincelejo © 2025</span>
          <span>Incremento 1 · v1.0</span>
        </div>
      </aside>

      {/* --- Panel Derecho: Formulario de Login --- */}
      <main className="login-form-pane">
        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="login-card__header">
              <span className="login-card__badge-role">Acceso al Sistema</span>
              <h1>Iniciar Sesión</h1>
              <p className="login-card__sub">Digita tus credenciales autorizadas para ingresar.</p>
            </div>

            {/* Accesos rápidos para pruebas */}
            <div className="quick-fill-section">
              <div className="quick-fill-title">
                <span>Acceso rápido de prueba</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="quick-fill-chips">
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickFill("admin", "Admin123*")}
                  title="Autocompletar como Administrador"
                >
                  <span className="quick-chip__role">Administrador</span>
                  <span className="quick-chip__user">admin</span>
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickFill("1001001", "Operario123*")}
                  title="Autocompletar como Operario"
                >
                  <span className="quick-chip__role">Operario</span>
                  <span className="quick-chip__user">1001001</span>
                </button>
              </div>
            </div>

            {/* Mensajes de error */}
            {validationError && (
              <div className="alert alert--danger" role="alert" id="login-validation-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{validationError}</span>
              </div>
            )}

            {errorMessage && (
              <div className="alert alert--danger" role="alert" id="login-auth-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-card__form" id="form-login">
              <label className="form__field">
                <span>Nombre de usuario</span>
                <div className="input-with-icon">
                  <div className="input-icon-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Ej. admin o tu usuario"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    disabled={isSubmitting}
                    id="input-login-username"
                  />
                </div>
              </label>

              <label className="form__field">
                <span>Contraseña</span>
                <div className="input-with-icon">
                  <div className="input-icon-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    disabled={isSubmitting}
                    id="input-login-password"
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={isSubmitting}
                id="btn-login-submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-card__footer">
              <span className="login-card__security-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Acceso seguro protegido mediante autenticación JWT</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
