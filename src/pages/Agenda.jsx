import { useEffect, useState } from 'react';
import { Phone, User, CalendarOff } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import Calendario from '../components/Calendario';
import CitaCard from '../components/CitaCard';
import Aviso from '../components/Aviso';
import DiasCerrados from '../components/DiasCerrados';
import { apiFetch, ERROR_CONEXION } from '../api';
import { obtenerUsuario } from '../sesion';
import { hoyTexto, formatearDia, capitalizar, diasDelRango } from '../utils/fechas';

function Agenda() {
  const usuario = obtenerUsuario();
  // Al entrar se muestra directamente el día de hoy.
  const [fecha, setFecha] = useState(hoyTexto());
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [bloqueos, setBloqueos] = useState([]);
  const [recargaBloqueos, setRecargaBloqueos] = useState(0);
  // 'mias' = solo mis citas; 'todas' = las de toda la clínica
  const [vista, setVista] = useState('mias');

  useEffect(() => {
    let activo = true;
    apiFetch('/bloqueos')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => { if (activo) setBloqueos(data); })
      .catch(() => {});
    return () => { activo = false; };
  }, [recargaBloqueos]);

  // Días cerrados (míos o de toda la clínica), para marcarlos en el calendario,
  // y el cierre del día que se está viendo.
  const diasCerrados = new Set(bloqueos.flatMap((b) => diasDelRango(b.fechainicio, b.fechafin)));
  const cierreDelDia = bloqueos.find((b) => fecha >= b.fechainicio && fecha <= b.fechafin);

  function cambiarVista(nueva) {
    setVista(nueva);
    setCargando(true);
    setAviso(null);
  }

  function irADia(dia, todas = false) {
    if (todas) setVista('todas');
    elegirFecha(dia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function elegirFecha(nuevaFecha) {
    setFecha(nuevaFecha);
    setCargando(true);
    setAviso(null);
  }

  useEffect(() => {
    let activo = true;
    apiFetch(`/appointments?fecha=${fecha}${vista === 'todas' ? '&todas=1' : ''}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => { if (activo) setCitas(data); })
      .catch(() => { if (activo) setAviso({ tipo: 'error', texto: ERROR_CONEXION }); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [fecha, recarga, vista]);

  // La fisio puede cancelar sin la restricción de 24 h (lo controla el backend).
  // El motivo le llega al paciente por correo; el servidor responde si se ha podido enviar.
  async function handleCancelar(idCita, motivo) {
    try {
      const response = await apiFetch(`/appointments/${idCita}`, {
        method: 'PUT',
        body: JSON.stringify({ motivo })
      });
      const texto = await response.text();
      setAviso({ tipo: !response.ok ? 'error' : texto.includes('no se ha podido') ? 'info' : 'ok', texto });
      setRecarga((n) => n + 1);
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    }
  }

  const numero = citas.length;

  return (
    <Pagina titulo="Mi agenda">
      <CabeceraPagina titulo="Mi agenda" subtitulo={`Hola, ${usuario.nombre}. Aquí tienes las citas de tus pacientes y las de la clínica.`} />

      <section className="contenedor panel-flotante">
        <div className="tarjeta panel-dos-columnas agenda">
          <div>
            <Calendario fechaSeleccionada={fecha} onSeleccionarFecha={elegirFecha} permitirPasado diasMarcados={diasCerrados} />
            <button type="button" className="btn-texto" onClick={() => elegirFecha(hoyTexto())}>
              Volver a hoy
            </button>
          </div>

          <div>
            <div className="pestañas agenda-vista" role="tablist">
              <button type="button" role="tab" aria-selected={vista === 'mias'}
                className={vista === 'mias' ? 'pestaña activa' : 'pestaña'} onClick={() => cambiarVista('mias')}>
                Mis citas
              </button>
              <button type="button" role="tab" aria-selected={vista === 'todas'}
                className={vista === 'todas' ? 'pestaña activa' : 'pestaña'} onClick={() => cambiarVista('todas')}>
                Toda la clínica
              </button>
            </div>
            <div className="agenda-cabecera">
              <h2>{capitalizar(formatearDia(fecha))}</h2>
              {!cargando && <span className="contador grande">{numero} {numero === 1 ? 'cita' : 'citas'}</span>}
            </div>
            {cierreDelDia && (
              <p className="banda-cerrado">
                <CalendarOff size={18} aria-hidden="true" />
                {cierreDelDia.todalaclinica ? 'La clínica está cerrada' : 'Has cerrado'} este día
                {cierreDelDia.motivo ? ` (${cierreDelDia.motivo})` : ''}.
                {cierreDelDia.todalaclinica ? ' Nadie puede reservar.' : ' Los pacientes no pueden reservar contigo.'}
              </p>
            )}
            <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

            {cargando ? (
              <p className="estado-vacio">Cargando agenda…</p>
            ) : numero === 0 ? (
              <p className="estado-vacio">No hay citas este día.</p>
            ) : (
              <div className="lista-citas">
                {citas.map((cita) => {
                  // Cada fisio solo puede cancelar sus propias citas.
                  const esMia = cita.idfisio === usuario.id;
                  return (
                    <CitaCard
                      key={cita.id}
                      cita={cita}
                      onCancelar={esMia ? handleCancelar : null}
                      pedirMotivo
                      vistaDia
                      titulo={<><User size={15} aria-hidden="true" /> {cita.nombre} {cita.apellidos}</>}
                      detalle={
                        <div className="cita-paciente">
                          <a href={`tel:${cita.telefono}`}><Phone size={14} aria-hidden="true" /> {cita.telefono}</a>
                          {vista === 'todas' && (
                            <span className={esMia ? 'cita-fisio mia' : 'cita-fisio'}>
                              {esMia ? 'Tuya' : `Con ${cita.nombrefisio}`}
                            </span>
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <DiasCerrados
        bloqueos={bloqueos}
        onCambio={() => setRecargaBloqueos((n) => n + 1)}
        onIrADia={irADia}
      />
    </Pagina>
  );
}

export default Agenda;
