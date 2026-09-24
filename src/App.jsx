import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppRoutes } from "./router.jsx";
import { GlobalLoadingBar } from "./shared/components/GlobalLoadingBar.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalLoadingBar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
