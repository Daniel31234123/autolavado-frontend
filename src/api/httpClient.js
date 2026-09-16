const RAW_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-autolavado-1.onrender.com";

const BASE_URL = String(RAW_BASE_URL).trim().replace(/\/+$/, "");

/**
 * Almacén en memoria del token y callback de deslogueo
 */
let authToken = null;
let onUnauthorizedCallback = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken || localStorage.getItem("autolavado_token") || null;
}

export function setUnauthorizedHandler(callback) {
  onUnauthorizedCallback = callback;
}

/**
 * Error de API enriquecido con el status HTTP y el cuerpo de la respuesta.
 */
export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("text/json")) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => null);
}

/**
 * Wrapper único sobre fetch para toda la app.
 * Adjunta Authorization: Bearer <token> si está disponible.
 * Maneja 401 (deslogueo) y 403 (no autorizado).
 *
 * @param {string} path - ruta relativa, ej: "/api/v1/turnos"
 * @param {RequestInit} [options]
 */
export async function httpRequest(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL}${cleanPath}`;
  const currentToken = getAuthToken();

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new ApiError(
      `No fue posible conectar con el servidor en ${BASE_URL}. Revisa tu conexión o el estado del backend.`,
      { status: 0, body: networkError }
    );
  }

  const body = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof onUnauthorizedCallback === "function") {
        onUnauthorizedCallback();
      }
    }

    let message = "Error al comunicarse con la API";

    if (body && typeof body === "object") {
      if (body.detail) {
        message = body.detail;
      } else if (body.title) {
        message = body.title;
      } else if (body.message) {
        message = body.message;
      } else if (body.errors) {
        if (typeof body.errors === "string") {
          message = body.errors;
        } else if (typeof body.errors === "object") {
          const firstErrorKey = Object.keys(body.errors)[0];
          const firstErrorVal = body.errors[firstErrorKey];
          message = Array.isArray(firstErrorVal)
            ? firstErrorVal[0]
            : String(firstErrorVal);
        }
      }
    } else if (typeof body === "string" && body.trim().length > 0) {
      message = body;
    }

    if (response.status === 401 && (!message || message.includes("401") || message.includes("Error"))) {
      message = "Usuario o contraseña incorrectos";
    }

    throw new ApiError(message, { status: response.status, body });
  }

  return body;
}

export const http = {
  get: (path) => httpRequest(path, { method: "GET" }),
  post: (path, data) =>
    httpRequest(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: (path, data) =>
    httpRequest(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (path, data) =>
    httpRequest(path, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (path) => httpRequest(path, { method: "DELETE" }),
};
