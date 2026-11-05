import { obtenerToken, cerrarSesion } from './sesion';

const API_URL = import.meta.env.VITE_API_URL;

// Mensaje para cuando ni siquiera se llega al servidor (sin internet, servidor caído...).
export const ERROR_CONEXION = 'No se ha podido conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

// Envoltorio de fetch para hablar con el backend:
// - añade la URL base y la cabecera JSON
// - añade el token si hay sesión ("Authorization: Bearer <token>")
// - si el servidor dice que la sesión no vale (401), la cierra y manda a /acceso
export async function apiFetch(ruta, opciones = {}) {
  const token = obtenerToken();
  const headers = { 'Content-Type': 'application/json', ...opciones.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await conAvisoSiTarda(fetch(`${API_URL}${ruta}`, { ...opciones, headers }));

  // Solo redirigimos si había token: un 401 en el login (contraseña mal) es normal.
  if (response.status === 401 && token) {
    cerrarSesion();
    window.location.href = '/acceso';
  }

  return response;
}

// ---- Servidor dormido ----
// El servidor gratuito de Render se apaga cuando nadie lo usa y tarda hasta un minuto en
// volver a arrancar. Para que el paciente no piense que la web no funciona:
// 1) despertarServidor(): al abrir la web se le da un "toque" para que vaya arrancando
//    mientras el paciente lee la página o escribe su usuario.
// 2) Si una petición tarda más de SEGUNDOS_AVISO, se avisa (componente AvisoServidor)
//    de que se está conectando, y el aviso se quita solo cuando responde.

const SEGUNDOS_AVISO = 3;
export const EVENTO_SERVIDOR_LENTO = 'servidor-lento';
let lentas = 0;

function avisar(lento) {
  window.dispatchEvent(new CustomEvent(EVENTO_SERVIDOR_LENTO, { detail: lento }));
}

async function conAvisoSiTarda(promesa) {
  let tarda = false;
  const temporizador = setTimeout(() => {
    tarda = true;
    lentas += 1;
    if (lentas === 1) avisar(true);
  }, SEGUNDOS_AVISO * 1000);
  try {
    return await promesa;
  } finally {
    clearTimeout(temporizador);
    if (tarda) {
      lentas -= 1;
      if (lentas === 0) avisar(false);
    }
  }
}

export function despertarServidor() {
  if (!API_URL) return;
  fetch(`${API_URL}/`, { cache: 'no-store' }).catch(() => {});
}
