// Utilidades para trabajar con las fechas tal como las guarda el backend:
// "2026-11-10" para días y "2026-11-10 17:00" para citas (hora local de la clínica).

const dosCifras = (n) => String(n).padStart(2, '0');

// Date -> "2026-11-10" (usando la hora local, no UTC)
export function aTextoFecha(fecha) {
  return `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;
}

export function hoyTexto() {
  return aTextoFecha(new Date());
}

// "2026-11-10" o "2026-11-10 17:00" -> Date en hora local.
// (new Date("2026-11-10") lo interpretaría en UTC y podría dar el día anterior.)
export function aDate(texto) {
  const [dia, hora = '00:00'] = texto.split(/[ T]/);
  const [a, m, d] = dia.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  return new Date(a, m - 1, d, h, min);
}

// "2026-11-10" -> "martes, 10 de noviembre" (con el año si no es el actual)
export function formatearDia(texto) {
  const fecha = aDate(texto);
  const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
  if (fecha.getFullYear() !== new Date().getFullYear()) opciones.year = 'numeric';
  return fecha.toLocaleDateString('es-ES', opciones);
}

// "2026-11-10 17:00" -> { dia: 'martes, 10 de noviembre', hora: '17:00', numero: 10, mes: 'nov' }
export function partesCita(datetime) {
  const fecha = aDate(datetime);
  return {
    dia: formatearDia(datetime),
    hora: `${dosCifras(fecha.getHours())}:${dosCifras(fecha.getMinutes())}`,
    numero: fecha.getDate(),
    mes: fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
  };
}

// Primera letra en mayúscula ("martes, 10..." -> "Martes, 10...")
export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// "2026-11-10" + 3 -> "2026-11-13"
export function sumarDias(fecha, dias) {
  const d = aDate(fecha);
  d.setDate(d.getDate() + dias);
  return aTextoFecha(d);
}

// Todas las fechas de un rango, ambas incluidas: ("2026-11-10", "2026-11-12") -> [10, 11, 12]
export function diasDelRango(inicio, fin) {
  const dias = [];
  for (let dia = inicio; dia <= fin && dias.length < 400; dia = sumarDias(dia, 1)) dias.push(dia);
  return dias;
}

// Texto de un rango: "martes, 10 de noviembre" o "del 10 de noviembre al 13 de noviembre"
export function formatearRango(inicio, fin) {
  if (inicio === fin) return formatearDia(inicio);
  const corto = (f) => aDate(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  return `del ${corto(inicio)} al ${corto(fin)}`;
}
