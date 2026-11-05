import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, Clock } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import Calendario from '../components/Calendario';
import Aviso from '../components/Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { DIAS_ABIERTO } from '../datos/clinica';
import { aDate, hoyTexto, formatearDia, capitalizar, sumarDias } from '../utils/fechas';

// El calendario solo deja elegir los días que abre la clínica.
const esDiaDeApertura = (fecha) => DIAS_ABIERTO.includes(aDate(fecha).getDay());

// Si se llega desde un hueco del inicio (/reservar?fecha=2026-11-10&hora=10:30),
// se preselecciona; si la fecha no es válida, pasada o un día cerrado, se ignora.
function huecoDeLaUrl(params) {
  const fecha = params.get('fecha') || '';
  const hora = params.get('hora') || '';
  const valida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha >= hoyTexto() && esDiaDeApertura(fecha);
  return valida ? { fecha, hora: /^\d{2}:\d{2}$/.test(hora) ? hora : '' } : { fecha: '', hora: '' };
}

function Reservar() {
  const [params] = useSearchParams();
  const [inicial] = useState(() => huecoDeLaUrl(params));
  const [fecha, setFecha] = useState(inicial.fecha);
  const [horas, setHoras] = useState([]);
  const [cargando, setCargando] = useState(Boolean(inicial.fecha));
  const [errorHoras, setErrorHoras] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState(inicial.hora);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [reservada, setReservada] = useState(null); // { fecha, hora } tras reservar
  const [recarga, setRecarga] = useState(0);
  // Días que la clínica ha cerrado (vacaciones, festivos...) en los próximos meses.
  const [diasCerrados, setDiasCerrados] = useState(() => new Set());

  useEffect(() => {
    const hoy = hoyTexto();
    apiFetch(`/dias-cerrados?desde=${hoy}&hasta=${sumarDias(hoy, 180)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((dias) => setDiasCerrados(new Set(dias)))
      .catch(() => {}); // si falla, el servidor seguirá rechazando esos días al reservar
  }, []);

  const esDiaReservable = (dia) => esDiaDeApertura(dia) && !diasCerrados.has(dia);

  // Al elegir día se reinicia la hora. Antes se quedaba la del día anterior
  // y se podía reservar una hora que no estaba libre en el día nuevo.
  function elegirFecha(nuevaFecha) {
    setFecha(nuevaFecha);
    setHoraSeleccionada('');
    setAviso('');
    setCargando(true);
    setErrorHoras('');
  }

  // Cada vez que cambia el día (o tras reservar) se piden los huecos libres.
  useEffect(() => {
    if (!fecha) return;
    let activo = true;
    apiFetch(`/appointments/available?fecha=${fecha}`)
      .then(async (response) => {
        if (!activo) return;
        if (!response.ok) {
          setHoras([]);
          setErrorHoras(await response.text());
          return;
        }
        let lista = await response.json();
        // Si es hoy, quitamos las horas que ya han pasado.
        if (fecha === hoyTexto()) {
          const ahora = new Date();
          lista = lista.filter((h) => aDate(`${fecha} ${h.hora}`) > ahora);
        }
        setHoras(lista);
        // Si la hora preseleccionada ya no está libre (alguien la ha cogido), se quita.
        setHoraSeleccionada((hora) =>
          lista.some((h) => h.hora === hora && h.huecosLibres > 0) ? hora : ''
        );
      })
      .catch(() => activo && setErrorHoras(ERROR_CONEXION))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [fecha, recarga]);

  async function handleReservar(e) {
    e.preventDefault();
    setEnviando(true);
    setAviso('');
    try {
      const response = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({ datetime: `${fecha} ${horaSeleccionada}`, motivo: motivo.trim() })
      });
      if (!response.ok) {
        // Por ejemplo, si otra persona ha cogido el hueco mientras tanto.
        setAviso(await response.text());
        setHoraSeleccionada('');
        setRecarga((n) => n + 1);
        return;
      }
      setReservada({ fecha, hora: horaSeleccionada });
    } catch {
      setAviso(ERROR_CONEXION);
    } finally {
      setEnviando(false);
    }
  }

  function reservarOtra() {
    setReservada(null);
    setFecha('');
    setHoras([]);
    setHoraSeleccionada('');
    setMotivo('');
  }

  if (reservada) {
    return (
      <Pagina titulo="Cita reservada" noIndexar>
        <CabeceraPagina titulo="Reservar cita" />
        <section className="contenedor panel-flotante">
          <div className="tarjeta confirmacion">
            <span className="icono-circulo grande"><CalendarCheck size={32} aria-hidden="true" /></span>
            <h2>¡Cita reservada!</h2>
            <p className="confirmacion-fecha">
              {capitalizar(formatearDia(reservada.fecha))} a las {reservada.hora}
            </p>
            <p className="texto-suave">
              Si no puedes venir, cancélala desde «Mis citas» con al menos 24 horas de antelación.
            </p>
            <div className="botones-fila">
              <Link to="/mis-citas" className="btn btn-primario">Ver mis citas</Link>
              <button type="button" className="btn btn-secundario" onClick={reservarOtra}>Reservar otra</button>
            </div>
          </div>
        </section>
      </Pagina>
    );
  }

  return (
    <Pagina titulo="Reservar cita" noIndexar>
      <CabeceraPagina titulo="Reservar cita" subtitulo="Elige el día y la hora que mejor te vengan." />

      <section className="contenedor panel-flotante">
        <div className="tarjeta panel-dos-columnas">
          <div>
            <h2 className="paso-titulo"><span>1</span> Elige el día</h2>
            <Calendario fechaSeleccionada={fecha} onSeleccionarFecha={elegirFecha} esDiaDisponible={esDiaReservable} />
            <p className="nota-calendario">Abrimos de lunes a viernes. Los días en gris no tienen citas disponibles.</p>
          </div>

          <div>
            <h2 className="paso-titulo"><span>2</span> Elige la hora</h2>
            {!fecha && <p className="estado-vacio">Selecciona un día en el calendario para ver las horas libres.</p>}
            {fecha && cargando && <p className="estado-vacio">Buscando huecos libres…</p>}
            {fecha && !cargando && errorHoras && <Aviso tipo="error">{errorHoras}</Aviso>}
            {fecha && !cargando && !errorHoras && horas.length === 0 && (
              <p className="estado-vacio">No quedan horas disponibles este día. Prueba con otro.</p>
            )}
            {fecha && !cargando && horas.length > 0 && (
              <>
                <p className="texto-suave dia-elegido">{capitalizar(formatearDia(fecha))}</p>
                <div className="horas-grid">
                  {horas.map(({ hora, huecosLibres }) => (
                    <button
                      type="button"
                      key={hora}
                      className={['hora', hora === horaSeleccionada && 'seleccionada', huecosLibres === 1 && 'ultimo'].filter(Boolean).join(' ')}
                      disabled={huecosLibres === 0}
                      aria-pressed={hora === horaSeleccionada}
                      onClick={() => setHoraSeleccionada(hora)}
                    >
                      <Clock size={14} aria-hidden="true" /> {hora}
                      {/* Los pacientes ven cuántas citas quedan a cada hora */}
                      <span className="hora-estado">
                        {huecosLibres === 0 ? 'Completo' : huecosLibres === 1 ? '1 libre' : `${huecosLibres} libres`}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {horaSeleccionada && (
              <form onSubmit={handleReservar} className="formulario reservar-form">
                <h2 className="paso-titulo"><span>3</span> Confirma tu cita</h2>
                <div className="campo">
                  <label htmlFor="motivo">Motivo de la consulta</label>
                  <textarea
                    id="motivo" rows={2} maxLength={200} required
                    placeholder="Ej: dolor de espalda desde hace una semana"
                    value={motivo} onChange={(e) => setMotivo(e.target.value)}
                  />
                </div>
                <div className="resumen-reserva">
                  <CalendarCheck size={20} aria-hidden="true" />
                  <span>{capitalizar(formatearDia(fecha))} a las <strong>{horaSeleccionada}</strong></span>
                </div>
                <Aviso tipo="error">{aviso}</Aviso>
                <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando || !motivo.trim()}>
                  {enviando ? 'Reservando…' : 'Confirmar cita'}
                </button>
              </form>
            )}
            {!horaSeleccionada && <Aviso tipo="error">{aviso}</Aviso>}
          </div>
        </div>
      </section>
    </Pagina>
  );
}

export default Reservar;
