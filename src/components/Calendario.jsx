import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { aTextoFecha, hoyTexto, formatearDia, aDate } from '../utils/fechas';

const diasSemanaCorto = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Props:
// - fechaSeleccionada: "2026-11-10" o ''
// - onSeleccionarFecha(fecha)
// - esDiaDisponible(fecha): opcional; si devuelve false, el día sale desactivado
// - permitirPasado: si es false (por defecto) no deja ir a meses ni días pasados
// - diasMarcados: opcional, Set de fechas que se pintan como "cerradas" (sin desactivarlas)
function Calendario({ fechaSeleccionada, onSeleccionarFecha, esDiaDisponible, permitirPasado = false, diasMarcados }) {
  const [mesActual, setMesActual] = useState(() => {
    const base = fechaSeleccionada ? aDate(fechaSeleccionada) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const año = mesActual.getFullYear();
  const mes = mesActual.getMonth();
  const hoy = hoyTexto();
  const ahora = new Date();
  const esMesDeHoy = año === ahora.getFullYear() && mes === ahora.getMonth();

  const primerDiaSemana = new Date(año, mes, 1).getDay();
  const desplazamiento = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < desplazamiento; i++) celdas.push(null);
  for (let dia = 1; dia <= diasEnMes; dia++) celdas.push(dia);

  return (
    <div className="calendario">
      <div className="calendario-header">
        <button
          type="button"
          className="calendario-flecha"
          onClick={() => setMesActual(new Date(año, mes - 1, 1))}
          disabled={!permitirPasado && esMesDeHoy}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="calendario-mes" aria-live="polite">{nombresMeses[mes]} {año}</span>
        <button
          type="button"
          className="calendario-flecha"
          onClick={() => setMesActual(new Date(año, mes + 1, 1))}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendario-dias-semana" aria-hidden="true">
        {diasSemanaCorto.map((dia) => <span key={dia}>{dia}</span>)}
      </div>

      <div className="calendario-grid">
        {celdas.map((dia, indice) => {
          if (dia === null) {
            return <span key={`vacio-${indice}`} />;
          }
          const fecha = aTextoFecha(new Date(año, mes, dia));
          const pasado = fecha < hoy; // Las fechas "AAAA-MM-DD" se pueden comparar como texto
          const disponible = (permitirPasado || !pasado) && (!esDiaDisponible || esDiaDisponible(fecha));
          const clases = ['calendario-dia'];
          if (fecha === fechaSeleccionada) clases.push('activo');
          if (fecha === hoy) clases.push('hoy');
          const marcado = diasMarcados?.has(fecha);
          if (marcado) clases.push('marcado');

          return (
            <button
              type="button"
              key={fecha}
              data-fecha={fecha}
              className={clases.join(' ')}
              disabled={!disponible}
              aria-pressed={fecha === fechaSeleccionada}
              aria-label={formatearDia(fecha) + (fecha === hoy ? ' (hoy)' : '') + (marcado ? ' (cerrado)' : '')}
              onClick={() => onSeleccionarFecha(fecha)}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendario;
