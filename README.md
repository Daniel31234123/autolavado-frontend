# AutoLavado Express Sincelejo — Frontend

Panel operativo para la API de autolavado (Bahías, Operarios, Servicios, Turnos), construido en **React + Vite**, con arquitectura modular: cada recurso de la API vive en su propio módulo con sus componentes, hooks y servicio de API aislados.

## Requisitos

- Node.js 18 o superior

## Instalación

```bash
npm install
npm run dev
```

Configura `VITE_API_BASE_URL` en un archivo `.env` local antes de iniciar la app. Ese archivo está excluido del repositorio.

La app queda disponible en `http://localhost:5173`. Por defecto apunta al backend en `https://backend-autolavado-1.onrender.com` (ajustable en `.env`).

## Estructura

```
src/
  api/httpClient.js        # fetch wrapper único, usado por todos los servicios de módulo
  shared/                  # componentes y hooks genéricos, sin lógica de negocio
    components/
    hooks/
  modules/
    bahias/
      api/bahiasService.js
      constants/bahiaEnums.js
      hooks/
      components/
      BahiasPage.jsx
    operarios/            # misma forma: api / hooks / components / *Page.jsx
    servicios/
    turnos/
  router.jsx
  App.jsx
  main.jsx
```

Cada módulo es independiente: su `api/` solo llama a los endpoints de ese recurso, sus `hooks/` envuelven esas llamadas con estado de loading/error, y sus `components/` son puramente de ese recurso. La única excepción intencional es `TurnosPage`, que necesita datos de Servicios/Operarios/Bahías para los selects del formulario de turno — en vez de que el módulo de Turnos importe los servicios de los otros módulos, es la **página** la que compone los hooks de cada módulo y pasa los datos por props. Así ningún módulo depende internamente de otro.

## ⚠️ Sobre los enums (`TipoVehiculo`, `TipoBahia`, `EstadoBahia`, `EstadoTurno`)

El spec de OpenAPI del backend define estos campos como simples `integer`, sin exponer qué significa cada número. Mientras no tuve acceso al código fuente del backend, dejé valores de ejemplo razonables (basados en el dominio) en:

- `src/modules/bahias/constants/bahiaEnums.js`
- `src/modules/turnos/constants/turnoEnums.js`

Cada archivo tiene un comentario marcando esto. **Antes de usar la app en serio, confirma con el backend (o con tu amigo) los valores reales de esos enums y actualiza solo esos dos archivos** — el resto de la app no depende de los números directamente, así que el cambio queda aislado ahí.

## Endpoints cubiertos

| Método | Ruta | Módulo |
|---|---|---|
| GET | `/api/v1/bahias/disponibles` | Bahías |
| GET | `/api/v1/operarios/activos` | Operarios |
| POST | `/api/v1/operarios` | Operarios |
| GET | `/api/v1/servicios` | Servicios |
| GET | `/api/v1/turnos/activos` | Turnos |
| POST | `/api/v1/turnos` | Turnos |

## Próximos pasos sugeridos

- Si el backend agrega autenticación, el lugar natural es `src/api/httpClient.js` (un solo punto).
- Si agregan endpoints de edición/eliminación, van en el `api/<recurso>Service.js` correspondiente, con su hook en `hooks/`.
