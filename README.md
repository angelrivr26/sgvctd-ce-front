# Comprobantes electronicos SERNANP — frontend

Angular 22 con TypeScript estricto y modulos funcionales, siguiendo `core/`, `modules/` y `shared/` de Boletos.

## Inicio

Para trabajar con `backend-comprobantes` local:

```powershell
cd frontend-comprobantes
npm run start:local
```

Abrir http://localhost:4205. El proxy `/api` apunta a http://127.0.0.1:4005. El backend debe estar iniciado en otra terminal. Las credenciales locales se generan en `backend-comprobantes/.local/ACCESO_LOCAL.md`.

Para ejecutar el frontend local contra el backend desplegado en desarrollo:

```powershell
npm run start:desarrollo
```

Este modo redirige `/api` a `https://desarrollo.sernanp.gob.pe`. Requiere que el servidor haya publicado las rutas de `backend-comprobantes` bajo `/api/v1`; mientras esa ruta no exista, respondera con error aunque la compilacion sea correcta.

Para generar el artefacto que se desplegara en desarrollo:

```powershell
npm run build:desarrollo
```

El artefacto conserva `API_URL=/api/v1`. El proxy de Angular solo existe durante `ng serve`; en el servidor, Nginx/IIS debe dirigir `/api/v1` hacia `backend-comprobantes`.

Con Node 20.20.2 en PATH: `npm ci`, `npm start` y `npm run build`.

Para pruebas de navegador, con ambos servicios iniciados: `npm run test:e2e`. Usa Edge instalado en Windows; para otro ejecutable compatible definir `COMPROBANTES_BROWSER`. Las capturas y trazas se guardan en `test-results/`, que no se versiona. Las pruebas crean compras ficticias en el ambiente local.

## Funcionalidad inicial

- Sesion con cookie HttpOnly; no guarda claves de integracion en el navegador.
- Consulta paginada, busqueda, fecha de recepcion en Lima, estado, modalidad y tipo.
- Refresco automatico cuando la pestaña esta visible.
- Generador de compras ficticias y escenarios controlados.
- Detalle con varios boletos, documentos, historial y estado de entregas.
- Descarga autenticada y reenvio del mismo comprobante al buzon local de pruebas.
- Estados vacios, carga, errores, etiquetas accesibles y diseno adaptable.

No emite ante SUNAT ni envia correos reales. La interfaz lo indica expresamente.

## Mantenimiento

Los servicios HTTP estan en `core/services/http`. Las pantallas estan en `modules/auth` y `modules/comprobantes`; los estados reutilizables, en `shared`.

Registrar **cada cambio** en [la bitacora del backend](../backend-comprobantes/BITACORA.md). Las reglas estan en `AGENTS.md`.
