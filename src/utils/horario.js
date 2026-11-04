import { FRANJAS } from '../datos/clinica';

const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

const NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// ¿Está abierta la clínica ahora? Devuelve { abierto, texto }, por ejemplo:
// { abierto: true,  texto: 'Abierto ahora, cierra a las 21:00' }
// { abierto: false, texto: 'Cerrado ahora, abre mañana a las 09:30' }
export function estadoClinica(ahora = new Date()) {
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = FRANJAS[ahora.getDay()] || [];

  const abierta = hoy.find(([inicio, fin]) => minutos >= aMinutos(inicio) && minutos < aMinutos(fin));
  if (abierta) {
    return { abierto: true, texto: `Abierto ahora, cierra a las ${abierta[1]}` };
  }

  // Buscar la próxima apertura: primero lo que quede de hoy, luego los días siguientes.
  const quedaHoy = hoy.find(([inicio]) => aMinutos(inicio) > minutos);
  if (quedaHoy) {
    return { abierto: false, texto: `Cerrado ahora, abre hoy a las ${quedaHoy[0]}` };
  }
  for (let i = 1; i <= 7; i++) {
    const dia = (ahora.getDay() + i) % 7;
    if (FRANJAS[dia]) {
      const cuando = i === 1 ? 'mañana' : `el ${NOMBRES[dia]}`;
      return { abierto: false, texto: `Cerrado ahora, abre ${cuando} a las ${FRANJAS[dia][0][0]}` };
    }
  }
  return { abierto: false, texto: 'Cerrado ahora' };
}
