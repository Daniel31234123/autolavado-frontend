import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./shared/components/AppShell.jsx";
import { LandingPage } from "./modules/landing/LandingPage.jsx";
import { LoginPage } from "./modules/auth/LoginPage.jsx";
import { NoAutorizadoPage } from "./modules/auth/NoAutorizadoPage.jsx";
import { TurnosPage } from "./modules/turnos/TurnosPage.jsx";
import { OperariosPage } from "./modules/operarios/OperariosPage.jsx";
import { ReservaPage } from "./modules/cliente/ReservaPage.jsx";
import { TrazabilidadPage } from "./modules/cliente/TrazabilidadPage.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { RoleRoute } from "./routes/RoleRoute.jsx";

/**
 * Enrutador principal:
 * - / -> Landing pública
 * - /reservar, /reservas -> Agendamiento de Citas (RF-CL-01)
 * - /seguimiento, /track/:hash, /trazabilidad -> Monitoreo en Tiempo Real (RF-CL-02)
 * - /login -> Login público
 * - /turnos -> Autenticado (Administrador y Operario)
 * - /operarios -> Solo Administrador
 * - /no-autorizado -> Pública / Control de acceso
 * - * -> Redirige a /login
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Página Landing inicial */}
      <Route path="/" element={<LandingPage />} />

      {/* Incremento 2: Módulo del Cliente */}
      <Route path="/reservar" element={<ReservaPage />} />
      <Route path="/reservas" element={<ReservaPage />} />
      <Route path="/seguimiento" element={<TrazabilidadPage />} />
      <Route path="/trazabilidad" element={<TrazabilidadPage />} />
      <Route path="/track/:hash" element={<TrazabilidadPage />} />

      {/* Ruta pública de autenticación */}
      <Route path="/login" element={<LoginPage />} />

      {/* Ruta pública para accesos no autorizados por rol */}
      <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

      {/* Vistas protegidas dentro del Shell del sistema */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* /turnos accesible por Administrador y Operario */}
        <Route path="/turnos" element={<TurnosPage />} />

        {/* /operarios accesible EXCLUSIVAMENTE por Administrador */}
        <Route
          path="/operarios"
          element={
            <RoleRoute allowedRoles={["Administrador", "ADMINISTRADOR"]}>
              <OperariosPage />
            </RoleRoute>
          }
        />

        {/* Redirecciones de conveniencia hacia las rutas oficiales del Incremento 1 */}
        <Route path="/admin" element={<Navigate to="/operarios" replace />} />
        <Route path="/admin/turnos" element={<Navigate to="/turnos" replace />} />
        <Route path="/admin/operarios" element={<Navigate to="/operarios" replace />} />
      </Route>

      {/* Cualquier otra ruta redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
