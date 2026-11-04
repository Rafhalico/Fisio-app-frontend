# María Montaño Fisioterapia · Frontend

Web de la clínica de fisioterapia María Montaño (Gilena, Sevilla), con reserva de citas online.

- **Pacientes**: se registran (con verificación por email), reservan cita eligiendo día y hora libres, y consultan o cancelan sus citas.
- **Fisioterapeuta**: consulta su agenda diaria con los datos de contacto de cada paciente y puede cancelar citas.

El backend (Node + Express + PostgreSQL) está en [Fisio-app-backend](https://github.com/Rafhalico/Fisio-app-backend).

## Tecnologías

React 19 · React Router 7 · Vite · lucide-react (iconos) · Fontsource (fuentes servidas desde la propia web)

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y pon la URL del backend en VITE_API_URL
npm run dev            # http://localhost:5173
```

Otros comandos: `npm run build` (versión de producción en `dist/`), `npm run lint`.

## Estructura

```
src/
├── api.js              # fetch con la URL del backend y el token de sesión
├── sesion.js           # guardar / leer / cerrar la sesión
├── datos/clinica.js    # teléfono, dirección y horario (un solo sitio para cambiarlos)
├── utils/fechas.js     # formateo de fechas en español
├── hooks/useTitulo.js  # título de la pestaña por página
├── components/         # Navbar, Footer, Calendario, CitaCard, Aviso, RutaProtegida...
└── pages/              # Inicio, Acceso, Reservar, MisCitas, Agenda, NoEncontrada
```

## Despliegue

Es una SPA: el servidor debe devolver `index.html` para cualquier ruta (por ejemplo `/mis-citas`),
si no, al recargar una página interior sale un 404 del hosting.
En Netlify se hace con un archivo `public/_redirects` con `/* /index.html 200`;
en Vercel, con un `rewrites` en `vercel.json`.

> El horario de `src/datos/clinica.js` debe coincidir con el del backend.
