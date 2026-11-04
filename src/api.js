import { obtenerToken, cerrarSesion } from './sesion';

const API_URL = import.meta.env.VITE_API_URL;

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

  const response = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });

  // Solo redirigimos si había token: un 401 en el login (contraseña mal) es normal.
  if (response.status === 401 && token) {
    cerrarSesion();
    window.location.href = '/acceso';
  }

  return response;
}
