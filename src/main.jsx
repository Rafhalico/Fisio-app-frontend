import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fuentes servidas desde la propia web (antes venían de Google Fonts):
// carga más rápida y no se envía la IP de cada visitante a Google.
import '@fontsource/marcellus/latin-400.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import './index.css'
import App from './App.jsx'
import { despertarServidor } from './api'

// Nada más abrir la web, despertamos el servidor (ver api.js).
despertarServidor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
