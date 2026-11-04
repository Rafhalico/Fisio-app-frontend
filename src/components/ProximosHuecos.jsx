import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { DIAS_ABIERTO } from '../datos/clinica';
import { aDate, aTextoFecha, hoyTexto } from '../utils/fechas';

const DIAS_A_MOSTRAR = 3;  // días con huecos que se enseñan
const HORAS_POR_DIA = 3;   // horas como mucho por día
const DIAS_MAXIMO = 14;    // hasta dónde se busca como mucho

// "Hoy", "Mañana" o "Jueves 12"
function nombreDia(fecha) {
  const dias = Math.round((aDate(fecha) - aDate(hoyTexto())) / 86400000);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  const texto = aDate(fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Recorre los próximos días de apertura pidiendo la disponibilidad al backend
// (la misma ruta pública que usa la página de reservar) hasta reunir unos cuantos días con huecos.
async function buscarHuecos() {
  const dias = [];
  const ahora = new Date();
  const dia = new Date();
  for (let i = 0; i < DIAS_MAXIMO && dias.length < DIAS_A_MOSTRAR; i++, dia.setDate(dia.getDate() + 1)) {
    if (!DIAS_ABIERTO.includes(dia.getDay())) continue;
    const fecha = aTextoFecha(dia);
    const response = await apiFetch(`/appointments/available?fecha=${fecha}`);
    if (!response.ok) continue;
    const horas = (await response.json())
      .filter(({ hora, huecosLibres }) => huecosLibres > 0 && aDate(`${fecha} ${hora}`) > ahora)
      .map(({ hora }) => hora);
    if (horas.length) dias.push({ fecha, horas: horas.slice(0, HORAS_POR_DIA), hayMas: horas.length > HORAS_POR_DIA });
  }
  return dias;
}

function ProximosHuecos() {
  const [dias, setDias] = useState(null); // null = cargando
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    buscarHuecos()
      .then((lista) => { if (activo) setDias(lista); })
      .catch(() => { if (activo) setError(true); });
    return () => { activo = false; };
  }, []);

  return (
    <aside className="huecos" aria-labelledby="titulo-huecos">
      <h2 id="titulo-huecos" className="huecos-titulo">Próximos huecos libres</h2>

      {error || (dias && dias.length === 0) ? (
        <p className="huecos-vacio">
          {error ? 'No se ha podido consultar la disponibilidad.' : 'No hay huecos libres en los próximos días.'}
          {' '}Llámanos y buscamos un momento.
        </p>
      ) : (
        <div className="huecos-dias" aria-busy={dias === null}>
          {dias === null
            ? Array.from({ length: DIAS_A_MOSTRAR }, (_, i) => <div key={i} className="huecos-dia cargando" aria-hidden="true" />)
            : dias.map(({ fecha, horas, hayMas }) => (
              <div className="huecos-dia" key={fecha}>
                <h3>{nombreDia(fecha)}</h3>
                <ul>
                  {horas.map((hora) => (
                    <li key={hora}>
                      <Link
                        to={`/reservar?fecha=${fecha}&hora=${hora}`}
                        className="hueco"
                        aria-label={`Reservar ${nombreDia(fecha).toLowerCase()} a las ${hora}`}
                      >
                        {hora}
                      </Link>
                    </li>
                  ))}
                  {hayMas && (
                    <li><Link to={`/reservar?fecha=${fecha}`} className="hueco hueco-mas">Más</Link></li>
                  )}
                </ul>
              </div>
            ))}
        </div>
      )}

      <Link to="/reservar" className="huecos-mas">Ver todos los días</Link>
    </aside>
  );
}

export default ProximosHuecos;
