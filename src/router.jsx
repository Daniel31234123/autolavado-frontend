import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./shared/components/AppShell.jsx";
import { LandingPage } from "./modules/landing/LandingPage.jsx";
import { LoginPage } from "./modules/auth/LoginPage.jsx";
import { NoAutorizadoPage } from "./modules/auth/NoAutorizadoPage.jsx";
import { TurnosPage } from "./modules/turnos/TurnosPage.jsx";
import { OperariosPage } from "./modules/operarios/OperariosPage.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { RoleRoute } from "./routes/RoleRoute.jsx";

/**
 * Enrutador principal alineado estrictamente con el Incremento 1:
 * - / -> Landing pública
 * - /login -> Login público
 * - /turnos -> Autenticado (ambos roles)
 * - /operarios -> Solo Administrador
 * - /no-autorizado -> Pública / Control de acceso
 * - * -> Redirige a /login
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Página Landing inicial */}
      <Route path="/" element={<LandingPage />} />

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
