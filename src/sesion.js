// Todo lo relacionado con la sesión guardada en el navegador, en un solo sitio.
// El token es lo que demuestra al servidor quién eres; "usuario" solo sirve para
// mostrar el nombre y decidir qué páginas enseñar (el servidor no se fía de él).

export function guardarSesion({ token, usuario }) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function obtenerUsuario() {
  // Sin token no hay sesión válida (por ejemplo, datos antiguos de antes de este cambio).
  if (!obtenerToken()) return null;
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}
