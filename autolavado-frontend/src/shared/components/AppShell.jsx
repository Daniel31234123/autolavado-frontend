import { Sidebar } from "./Sidebar.jsx";

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__content">{children}</main>
    </div>
  );
}
