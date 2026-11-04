// Datos de la clínica en un solo sitio: si cambia el teléfono o el horario,
// se cambia aquí y se actualiza en toda la web.

export const CLINICA = {
  nombre: 'María Montaño Fisioterapia',
  telefono: '626 44 60 19',
  telefonoEnlace: 'tel:+34626446019',
  email: 'fisioterapiamariamongarcia@gmail.com',
  instagram: 'fisioterapia_mmg',
  direccion: 'C. La Cruz, 26, bajo',
  localidad: '41565 Gilena, Sevilla',
  mapa: 'https://www.google.com/maps/place/Fisioterapia+Mar%C3%ADa+Monta%C3%B1o/@37.2515137,-4.9153176,19z',
};

// IMPORTANTE: debe coincidir con "horarios" del backend (index.js),
// que es quien decide de verdad qué horas se pueden reservar.
export const HORARIO = [
  { dia: 'Lunes', franjas: ['16:00 – 21:00'] },
  { dia: 'Martes', franjas: ['09:30 – 13:30', '16:00 – 21:00'] },
  { dia: 'Miércoles', franjas: ['10:00 – 14:00', '16:00 – 21:00'] },
  { dia: 'Jueves', franjas: ['09:30 – 13:30', '16:00 – 21:00'] },
  { dia: 'Viernes', franjas: ['09:00 – 14:00'] },
  { dia: 'Sábado y domingo', franjas: [] },
];

// Días que abre, con la numeración de Date.getDay(): 0 = domingo ... 6 = sábado
export const DIAS_ABIERTO = [1, 2, 3, 4, 5];
