import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import CitaCard from '../components/CitaCard';
import Aviso from '../components/Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { aDate } from '../utils/fechas';
import { CLINICA } from '../datos/clinica';

const PESTAÑAS = [
  { id: 'proximas', nombre: 'Próximas' },
  { id: 'historial', nombre: 'Historial' },
  { id: 'canceladas', nombre: 'Canceladas' },
];

// Reparte las citas en las tres pestañas y las ordena:
// las próximas de la más cercana a la más lejana; el resto, de la más reciente a la más antigua.
function clasificar(citas) {
  const ahora = new Date();
  const porFecha = (a, b) => aDate(a.datetime) - aDate(b.datetime);
  return {
    proximas: citas.filter((c) => c.estado === 'reservada' && aDate(c.datetime) >= ahora).sort(porFecha),
    historial: citas.filter((c) => c.estado !== 'cancelada' && aDate(c.datetime) < ahora).sort((a, b) => porFecha(b, a)),
    canceladas: citas.filter((c) => c.estado === 'cancelada').sort((a, b) => porFecha(b, a)),
  };
}

function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pestaña, setPestaña] = useState('proximas');
  const [aviso, setAviso] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    apiFetch('/appointments/mias')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => { if (activo) setCitas(data); })
      .catch(() => { if (activo) setAviso({ tipo: 'error', texto: ERROR_CONEXION }); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [recarga]);

  async function handleCancelar(idCita) {
    try {
      const response = await apiFetch(`/appointments/${idCita}`, { method: 'PUT' });
      setAviso({
        tipo: response.ok ? 'ok' : 'error',
        texto: response.ok ? 'Cita cancelada correctamente.' : await response.text()
      });
      setRecarga((n) => n + 1);
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    }
  }

  const grupos = clasificar(citas);
  const lista = grupos[pestaña];

  return (
    <Pagina titulo="Mis citas" noIndexar>
      <CabeceraPagina
        titulo="Mis citas"
        subtitulo="Consulta tus próximas citas, revisa tu historial o cancela una cita si lo necesitas."
      />

      <section className="contenedor panel-flotante">
        <div className="tarjeta">
          <div className="panel-cabecera">
            <div className="pestañas" role="tablist">
              {PESTAÑAS.map(({ id, nombre }) => (
                <button
                  key={id} type="button" role="tab" aria-selected={pestaña === id}
                  className={pestaña === id ? 'pestaña activa' : 'pestaña'}
                  onClick={() => { setPestaña(id); setAviso(null); }}
                >
                  {nombre} <span className="contador">{grupos[id].length}</span>
                </button>
              ))}
            </div>
            <Link to="/reservar" className="btn btn-primario btn-pequeno">
              <CalendarPlus size={16} aria-hidden="true" /> Nueva cita
            </Link>
          </div>

          <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>
          {pestaña === 'proximas' && lista.length > 0 && (
            <p className="texto-suave nota">Puedes cancelar una cita hasta 24 horas antes.</p>
          )}
          {pestaña === 'historial' && lista.length > 0 && (
            <p className="nota nota-opinion">
              ¿Qué tal tus sesiones?{' '}
              <a href={CLINICA.escribirResena} target="_blank" rel="noopener noreferrer">Déjanos tu opinión en Google</a>
              {' '}— nos ayuda mucho.
            </p>
          )}

          {cargando ? (
            <p className="estado-vacio">Cargando tus citas…</p>
          ) : lista.length === 0 ? (
            <div className="estado-vacio">
              <p>
                {pestaña === 'proximas' && 'No tienes citas próximas.'}
                {pestaña === 'historial' && 'Aún no tienes citas pasadas.'}
                {pestaña === 'canceladas' && 'No tienes citas canceladas.'}
              </p>
              {pestaña === 'proximas' && <Link to="/reservar" className="btn btn-secundario">Reservar una cita</Link>}
            </div>
          ) : (
            <div className="lista-citas">
              {lista.map((cita) => (
                <CitaCard
                  key={cita.id}
                  cita={cita}
                  estado={pestaña === 'canceladas' ? 'Cancelada' : pestaña === 'historial' ? 'Realizada' : null}
                  onCancelar={pestaña === 'proximas' ? handleCancelar : null}
                  detalle={cita.canceladapor === 'fisio' && (
                    <p className="cita-nota">
                      Cancelada por la clínica{cita.motivocancelacion ? `: ${cita.motivocancelacion}` : '.'}
                    </p>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Pagina>
  );
}

export default MisCitas;
