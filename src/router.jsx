import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./shared/components/AppShell.jsx";
import { LandingPage } from "./modules/landing/LandingPage.jsx";
import { LoginPage } from "./modules/auth/LoginPage.jsx";
import { NoAutorizadoPage } from "./modules/auth/NoAutorizadoPage.jsx";
import { TurnosPage } from "./modules/turnos/TurnosPage.jsx";
import { DisplayPage } from "./modules/turnos/DisplayPage.jsx";
import { ServiciosPage } from "./modules/servicios/ServiciosPage.jsx";
import { BahiasPage } from "./modules/bahias/BahiasPage.jsx";
import { UsuariosPage } from "./modules/usuarios/UsuariosPage.jsx";
import { ReservasPage } from "./modules/reservas/ReservasPage.jsx";
import { DashboardPage } from "./modules/dashboard/DashboardPage.jsx";
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
 * - /usuarios -> Solo Administrador (operarios + administradores unificados)
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

      {/* Display público de patio (RF-06) */}
      <Route path="/display" element={<DisplayPage />} />

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

        {/* /dashboard, /servicios y /bahias EXCLUSIVAMENTE por Administrador.
            El operario solo ve sus turnos y las bahías disponibles dentro de /turnos. */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={["Administrador", "ADMINISTRADOR"]}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <RoleRoute allowedRoles={["Administrador", "ADMINISTRADOR"]}>
              <ServiciosPage />
            </RoleRoute>
          }
        />
        <Route
          path="/bahias"
          element={
            <RoleRoute allowedRoles={["Administrador", "ADMINISTRADOR"]}>
              <BahiasPage />
            </RoleRoute>
          }
        />

        {/* /usuarios unifica la gestión de operarios y administradores.
            Acceso EXCLUSIVO por Administrador. */}
        <Route
          path="/usuarios"
          element={
            <RoleRoute allowedRoles={["Administrador", "ADMINISTRADOR"]}>
              <UsuariosPage />
            </RoleRoute>
          }
        />

        {/* /admin/reservas EXCLUSIVAMENTE por Administrador */}
        <Route
          path="/admin/reservas"
          element={
            <RoleRoute allowedRoles={["Administrador", "ADMINISTRADOR"]}>
              <ReservasPage />
            </RoleRoute>
          }
        />

        {/* Redirecciones de conveniencia: la antigua sección de Operarios
            ahora vive unificada en /usuarios. */}
        <Route path="/operarios" element={<Navigate to="/usuarios" replace />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/turnos" element={<Navigate to="/turnos" replace />} />
        <Route path="/admin/operarios" element={<Navigate to="/usuarios" replace />} />
        <Route path="/admin/usuarios" element={<Navigate to="/usuarios" replace />} />
      </Route>

      {/* Cualquier otra ruta redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
