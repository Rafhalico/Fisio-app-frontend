import { useState } from 'react';
import { CalendarOff, Phone } from 'lucide-react';
import Aviso from './Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { hoyTexto, formatearRango, partesCita, capitalizar } from '../utils/fechas';

// Bloque de la agenda para cerrar días (vacaciones, festivos...) y volver a abrirlos.
// Los cierres son de la clínica: los ven y los gestionan las dos fisios.
// Props:
// - bloqueos: cierres [{ id, fechainicio, fechafin, motivo, plazas, nombreautor }]
// - plazasPorHora: huecos por hora normales (2)
// - onCambio(): para que la agenda vuelva a pedir los cierres tras crear o borrar uno
// - onIrADia(fecha): lleva la agenda a ese día (para ver y cancelar las citas afectadas)
function DiasCerrados({ bloqueos, plazasPorHora, onCambio, onIrADia }) {
  const hoy = hoyTexto();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  // Huecos que se cierran: 1 = solo trabaja un fisio; plazasPorHora = cerrado del todo
  const [plazas, setPlazas] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [afectadas, setAfectadas] = useState([]);
  const [confirmandoId, setConfirmandoId] = useState(null);

  const cerradoDelTodo = (n) => n >= plazasPorHora;

  async function cerrar(e) {
    e.preventDefault();
    setEnviando(true);
    setAviso(null);
    setAfectadas([]);
    try {
      const response = await apiFetch('/bloqueos', {
        method: 'POST',
        body: JSON.stringify({ fechaInicio: desde, fechaFin: hasta || desde, motivo, plazas })
      });
      if (!response.ok) {
        setAviso({ tipo: 'error', texto: await response.text() });
        return;
      }
      const { bloqueo, citasAfectadas } = await response.json();
      const unSoloDia = bloqueo.fechainicio === bloqueo.fechafin;
      const cuando = `${unSoloDia ? 'el ' : ''}${formatearRango(bloqueo.fechainicio, bloqueo.fechafin)}`;
      setAviso({
        tipo: 'ok',
        texto: cerradoDelTodo(bloqueo.plazas)
          ? `Has cerrado la clínica ${cuando}. Nadie puede reservar ${unSoloDia ? 'ese día' : 'esos días'}.`
          : `Listo: ${cuando} solo trabaja un fisio. Los pacientes podrán reservar ${plazasPorHora - bloqueo.plazas} cita por hora.`
      });
      setAfectadas(citasAfectadas);
      setDesde('');
      setHasta('');
      setMotivo('');
      setPlazas(1);
      onCambio();
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setEnviando(false);
    }
  }

  async function abrir(id) {
    try {
      const response = await apiFetch(`/bloqueos/${id}`, { method: 'DELETE' });
      setAviso({ tipo: response.ok ? 'ok' : 'error', texto: await response.text() });
      setAfectadas([]);
      onCambio();
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setConfirmandoId(null);
    }
  }

  return (
    <section className="contenedor dias-cerrados-seccion" aria-labelledby="titulo-dias-cerrados">
      <div className="tarjeta panel-dos-columnas">
        <form onSubmit={cerrar} className="formulario">
          <h2 id="titulo-dias-cerrados" className="tarjeta-titulo">
            <CalendarOff size={20} aria-hidden="true" /> Cerrar días
          </h2>
          <p className="texto-suave">Para vacaciones, festivos o cualquier día en que no estéis los dos.</p>
          <div className="campos-fila">
            <div className="campo">
              <label htmlFor="cierre-desde">Desde</label>
              <input id="cierre-desde" type="date" min={hoy} value={desde} required
                onChange={(e) => { setDesde(e.target.value); if (hasta && hasta < e.target.value) setHasta(''); }} />
            </div>
            <div className="campo">
              <label htmlFor="cierre-hasta">Hasta (incluido)</label>
              <input id="cierre-hasta" type="date" min={desde || hoy} value={hasta}
                onChange={(e) => setHasta(e.target.value)} aria-describedby="ayuda-hasta" />
              <small id="ayuda-hasta">Déjalo vacío si es un solo día.</small>
            </div>
          </div>

          <fieldset className="opciones-cierre">
            <legend>¿Cómo queda la clínica esos días?</legend>
            <label className={plazas === 1 ? 'casilla activa' : 'casilla'}>
              <input type="radio" name="plazas" checked={plazas === 1} onChange={() => setPlazas(1)} />
              <span>
                <strong>Solo trabaja un fisio</strong>
                <small>Se cierra 1 hueco: los pacientes pueden reservar 1 cita por hora.</small>
              </span>
            </label>
            <label className={cerradoDelTodo(plazas) ? 'casilla activa' : 'casilla'}>
              <input type="radio" name="plazas" checked={cerradoDelTodo(plazas)} onChange={() => setPlazas(plazasPorHora)} />
              <span>
                <strong>Cerrado del todo</strong>
                <small>No trabaja nadie: no se puede reservar ninguna cita.</small>
              </span>
            </label>
          </fieldset>

          <div className="campo">
            <label htmlFor="cierre-motivo">Motivo</label>
            <input id="cierre-motivo" value={motivo} maxLength={100} placeholder="Ej: vacaciones de Rafael"
              onChange={(e) => setMotivo(e.target.value)} aria-describedby="ayuda-motivo" />
            <small id="ayuda-motivo">Solo lo veis vosotros. Los pacientes solo ven cuántos huecos quedan.</small>
          </div>
          <button type="submit" className="btn btn-primario" disabled={enviando || !desde}>
            {enviando ? 'Guardando…' : 'Guardar cierre'}
          </button>
        </form>

        <div>
          <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

          {afectadas.length > 0 && (
            <div className="citas-afectadas" role="status">
              <p>
                <strong>Ya hay más citas que huecos en algunas horas.</strong>{' '}
                Las citas siguen en pie: decidid cuáles cancelar desde la agenda
                (al paciente le llegará un correo) o llamad para cambiarlas.
              </p>
              <ul>
                {afectadas.map((cita) => {
                  const { dia, hora } = partesCita(cita.datetime);
                  return (
                    <li key={cita.id}>
                      <span>{capitalizar(dia)}, {hora} · {cita.nombre} {cita.apellidos}</span>
                      {cita.telefono && <a href={`tel:${cita.telefono}`}><Phone size={14} aria-hidden="true" /> {cita.telefono}</a>}
                      <button type="button" className="btn-texto" onClick={() => onIrADia(cita.datetime.slice(0, 10))}>
                        Ir a ese día
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <h3 className="subtitulo-lista">Próximos días cerrados</h3>
          {bloqueos.length === 0 ? (
            <p className="estado-vacio">No hay ningún día cerrado.</p>
          ) : (
            <ul className="lista-cierres">
              {bloqueos.map((b) => (
                <li key={b.id}>
                  <div>
                    <span className="cierre-fechas">
                      {capitalizar(formatearRango(b.fechainicio, b.fechafin))}
                      <span className={cerradoDelTodo(b.plazas) ? 'etiqueta etiqueta-cerrado' : 'etiqueta etiqueta-un-fisio'}>
                        {cerradoDelTodo(b.plazas) ? 'Cerrado' : 'Un solo fisio'}
                      </span>
                    </span>
                    <span className="cierre-motivo">
                      {[b.motivo, b.nombreautor && `lo puso ${b.nombreautor}`].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  {confirmandoId === b.id ? (
                    <div className="confirmar-cancelacion">
                      <span>¿Quitar este cierre?</span>
                      <button type="button" className="btn btn-primario btn-pequeno" onClick={() => abrir(b.id)}>Sí, quitar</button>
                      <button type="button" className="btn-texto" onClick={() => setConfirmandoId(null)}>No</button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => setConfirmandoId(b.id)}>
                      Quitar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default DiasCerrados;
