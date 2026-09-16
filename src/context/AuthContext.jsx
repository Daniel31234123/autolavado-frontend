import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi.js";
import { setAuthToken, setUnauthorizedHandler } from "../api/httpClient.js";

const TOKEN_KEY = "autolavado_token";
const USER_KEY = "autolavado_user";
const ROLE_KEY = "autolavado_role";
const EXP_KEY = "autolavado_expires_at";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => localStorage.getItem(USER_KEY));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY));
  const [expiresAt, setExpiresAt] = useState(() => localStorage.getItem(EXP_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EXP_KEY);
    setToken(null);
    setUser(null);
    setRole(null);
    setExpiresAt(null);
    setAuthToken(null);
  }, []);

  useEffect(() => {
    // Configurar el manejador de 401 del httpClient
    setUnauthorizedHandler(logout);

    // Verificar expiración del token almacenado
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedExp = localStorage.getItem(EXP_KEY);

    if (storedToken && storedExp) {
      const expDate = new Date(storedExp);
      if (expDate <= new Date()) {
        logout();
      } else {
        setAuthToken(storedToken);
      }
    } else if (storedToken) {
      setAuthToken(storedToken);
    } else {
      logout();
    }

    setIsLoading(false);
  }, [logout]);

  const login = async (nombre_usuario, contrasena) => {
    const data = await authApi.login(nombre_usuario, contrasena);

    const receivedToken = data.token;
    const receivedUser = data.nombre_usuario || nombre_usuario;
    // Normalizar rol para comparar sin problemas de mayúsculas/minúsculas
    const rawRole = String(data.rol || "");
    const normalizedRole =
      rawRole.toUpperCase() === "ADMINISTRADOR" ? "Administrador" : "Operario";
    const receivedExp = data.expira_en || new Date(Date.now() + 60 * 60 * 1000).toISOString();

    localStorage.setItem(TOKEN_KEY, receivedToken);
    localStorage.setItem(USER_KEY, receivedUser);
    localStorage.setItem(ROLE_KEY, normalizedRole);
    localStorage.setItem(EXP_KEY, receivedExp);

    setToken(receivedToken);
    setUser(receivedUser);
    setRole(normalizedRole);
    setExpiresAt(receivedExp);
    setAuthToken(receivedToken);

    return {
      token: receivedToken,
      user: receivedUser,
      role: normalizedRole,
      expiresAt: receivedExp,
    };
  };

  const isAdmin = role === "Administrador" || role === "ADMINISTRADOR";
  const isOperario = role === "Operario" || role === "OPERARIO";
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        expiresAt,
        isLoading,
        isAuthenticated,
        isAdmin,
        isOperario,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
