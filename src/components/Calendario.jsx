import { useState } from 'react';

const diasSemanaCorto = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function Calendario({ fechaSeleccionada, onSeleccionarFecha }) {
  const [mesActual, setMesActual] = useState(new Date());

  const año = mesActual.getFullYear();
  const mes = mesActual.getMonth();

  const primerDiaSemana = new Date(año, mes, 1).getDay();
  const desplazamiento = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < desplazamiento; i++) {
    celdas.push(null);
  }
  for (let dia = 1; dia <= diasEnMes; dia++) {
    celdas.push(dia);
  }

  function irMesAnterior() {
    setMesActual(new Date(año, mes - 1, 1));
  }

  function irMesSiguiente() {
    setMesActual(new Date(año, mes + 1, 1));
  }

  function seleccionarDia(dia) {
    const mesTexto = String(mes + 1).padStart(2, '0');
    const diaTexto = String(dia).padStart(2, '0');
    const fechaTexto = `${año}-${mesTexto}-${diaTexto}`;
    onSeleccionarFecha(fechaTexto);
  }

  return (
    <div className="calendario">
      <div className="calendario-header">
        <button className="calendario-flecha" onClick={irMesAnterior}>‹</button>
        <span className="calendario-mes">{nombresMeses[mes]} {año}</span>
        <button className="calendario-flecha" onClick={irMesSiguiente}>›</button>
      </div>

      <div className="calendario-dias-semana">
        {diasSemanaCorto.map((dia) =>
          <span key={dia}>{dia}</span>
        )}
      </div>

      <div className="calendario-grid">
        {celdas.map((dia, indice) => {
          if (dia === null) {
            return <span key={indice} className="calendario-vacio"></span>;
          }
          const mesTexto = String(mes + 1).padStart(2, '0');
          const diaTexto = String(dia).padStart(2, '0');
          const fechaTexto = `${año}-${mesTexto}-${diaTexto}`;
          const seleccionado = fechaTexto === fechaSeleccionada;

          return (
            <button
              key={indice}
              className={seleccionado ? "calendario-dia-activo" : "calendario-dia"}
              onClick={() => seleccionarDia(dia)}
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