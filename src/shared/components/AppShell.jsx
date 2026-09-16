import { Sidebar } from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__content"><Outlet /></main>
    </div>
  );
}
