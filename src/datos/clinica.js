// Datos de la clínica en un solo sitio: si cambia el teléfono o el horario,
// se cambia aquí y se actualiza en toda la web.

export const CLINICA = {
  nombre: 'María Montaño Fisioterapia',
  telefono: '626 44 60 19',
  telefonoEnlace: 'tel:+34626446019',
  // Abre un chat de WhatsApp con la clínica, con el primer mensaje ya escrito (el paciente puede cambiarlo)
  whatsapp: `https://wa.me/34626446019?text=${encodeURIComponent('Hola, quería información sobre la clínica.')}`,
  email: 'fisioterapiamariamongarcia@gmail.com',
  // Ficha de la clínica en Google: ver las opiniones y abrir directamente "Escribir una reseña"
  resenas: 'https://maps.app.goo.gl/dXeb1o7bget75Z1G6',
  escribirResena: 'https://search.google.com/local/writereview?placeid=ChIJJT5sYIRXbQ0RusI2qCEiWGU',
  instagram: 'fisioterapia_mmg',
  direccion: 'C. La Cruz, 26, bajo',
  localidad: '41565 Gilena, Sevilla',
  mapa: 'https://www.google.com/maps/place/Fisioterapia+Mar%C3%ADa+Monta%C3%B1o/@37.2515137,-4.9153176,19z',
};

// Franjas de apertura por día, con la numeración de Date.getDay():
// 0 = domingo, 1 = lunes ... 6 = sábado.
// IMPORTANTE: debe coincidir con "horarios" del backend (index.js),
// que es quien decide de verdad qué horas se pueden reservar.
export const FRANJAS = {
  1: [['16:00', '21:00']],
  2: [['09:30', '13:30'], ['16:00', '21:00']],
  3: [['10:00', '14:00'], ['16:00', '21:00']],
  4: [['09:30', '13:30'], ['16:00', '21:00']],
  5: [['09:00', '14:00']],
};

export const DIAS_ABIERTO = Object.keys(FRANJAS).map(Number);

// Horario para mostrar (tabla del inicio y pie de página)
const nombreDia = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes' };
export const HORARIO = [
  ...DIAS_ABIERTO.map((n) => ({
    dia: nombreDia[n],
    numeros: [n],
    franjas: FRANJAS[n].map(([inicio, fin]) => `${inicio} – ${fin}`),
  })),
  { dia: 'Sábado y domingo', numeros: [6, 0], franjas: [] },
];
