import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ERROR_CONEXION } from '../../api';

// Pide datos al servidor y los vuelve a pedir cuando cambia la ruta (filtros) o se llama a recargar().
export function useDatos(ruta) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [vuelta, setVuelta] = useState(0);
  // "Cargando" = la última respuesta recibida no es de la petición actual
  const clave = `${ruta}#${vuelta}`;
  const [claveRecibida, setClaveRecibida] = useState(null);

  useEffect(() => {
    let activo = true;
    apiFetch(ruta)
      .then(async (r) => {
        if (!activo) return;
        if (r.ok) { setDatos(await r.json()); setError(null); }
        else setError(await r.text());
      })
      .catch(() => { if (activo) setError(ERROR_CONEXION); })
      .finally(() => { if (activo) setClaveRecibida(`${ruta}#${vuelta}`); });
    return () => { activo = false; };
  }, [ruta, vuelta]);

  const recargar = useCallback(() => setVuelta((n) => n + 1), []);
  return { datos, error, cargando: claveRecibida !== clave, recargar };
}

// "2026-11-05T17:31:16Z" -> "5 nov, 18:31"
export function fechaHora(iso) {
  return new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
}

// "2026-11-09 17:00" -> "lun 9 nov · 17:00"
export function citaCorta(datetime) {
  const [dia, hora] = datetime.split(' ');
  const [a, m, d] = dia.split('-').map(Number);
  const texto = new Date(a, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  return `${texto} · ${hora}`;
}
