import { Navigate, Route, Routes } from "react-router-dom";
import { TurnosPage } from "./modules/turnos/TurnosPage.jsx";
import { BahiasPage } from "./modules/bahias/BahiasPage.jsx";
import { OperariosPage } from "./modules/operarios/OperariosPage.jsx";
import { ServiciosPage } from "./modules/servicios/ServiciosPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/turnos" replace />} />
      <Route path="/turnos" element={<TurnosPage />} />
      <Route path="/bahias" element={<BahiasPage />} />
      <Route path="/operarios" element={<OperariosPage />} />
      <Route path="/servicios" element={<ServiciosPage />} />
      <Route path="*" element={<Navigate to="/turnos" replace />} />
    </Routes>
  );
}
