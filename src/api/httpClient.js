const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://backend-autolavado-1.onrender.com";

/**
 * Error de API enriquecido con el status HTTP y el cuerpo de la respuesta,
 * para que cada módulo pueda decidir cómo mostrarlo.
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
 * Cada servicio de módulo (bahiasService, turnosService, ...) llama a esto
 * en vez de usar fetch directamente, así el manejo de errores y base URL
 * vive en un solo lugar.
 *
 * @param {string} path - ruta relativa, ej: "/api/v1/turnos"
 * @param {RequestInit} [options]
 */
export async function httpRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const body = await parseBody(response);

  if (!response.ok) {
    const validationDetails =
      body && typeof body === "object"
        ? body.errors || body.detail || body.details
        : null;
    const message =
      (body && typeof body === "object" && (body.title || body.message)) ||
      (validationDetails
        ? typeof validationDetails === "string"
          ? validationDetails
          : JSON.stringify(validationDetails)
        : null) ||
      `Error ${response.status} al comunicarse con la API`;
    throw new ApiError(message, { status: response.status, body });
  }

  return body;
}

export const http = {
  get: (path) => httpRequest(path, { method: "GET" }),
  post: (path, data) => httpRequest(path, { method: "POST", body: JSON.stringify(data) }),
};
