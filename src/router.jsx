import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./shared/components/AppShell.jsx";
import { DashboardPage } from "./modules/dashboard/DashboardPage.jsx";
import { LandingPage } from "./modules/landing/LandingPage.jsx";
import { TurnosPage } from "./modules/turnos/TurnosPage.jsx";
import { BahiasPage } from "./modules/bahias/BahiasPage.jsx";
import { OperariosPage } from "./modules/operarios/OperariosPage.jsx";
import { ServiciosPage } from "./modules/servicios/ServiciosPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/turnos" element={<TurnosPage />} />
        <Route path="/admin/bahias" element={<BahiasPage />} />
        <Route path="/admin/operarios" element={<OperariosPage />} />
        <Route path="/admin/servicios" element={<ServiciosPage />} />
        <Route path="/turnos" element={<Navigate to="/admin/turnos" replace />} />
        <Route path="/bahias" element={<Navigate to="/admin/bahias" replace />} />
        <Route path="/operarios" element={<Navigate to="/admin/operarios" replace />} />
        <Route path="/servicios" element={<Navigate to="/admin/servicios" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
