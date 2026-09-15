import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./shared/components/AppShell.jsx";
import { AppRoutes } from "./router.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  );
}
