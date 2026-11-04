import { useState } from 'react';
import { CalendarOff, Phone } from 'lucide-react';
import Aviso from './Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { hoyTexto, formatearRango, partesCita, capitalizar } from '../utils/fechas';

// Bloque de la agenda para cerrar días (vacaciones, festivos...) y volver a abrirlos.
// Props:
// - bloqueos: lista de cierres de la fisio [{ id, fechainicio, fechafin, motivo }]
// - onCambio(): para que la agenda vuelva a pedir los cierres tras crear o borrar uno
// - onIrADia(fecha): lleva la agenda a ese día (para ver y cancelar las citas afectadas)
function DiasCerrados({ bloqueos, onCambio, onIrADia }) {
  const hoy = hoyTexto();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [afectadas, setAfectadas] = useState([]);
  const [confirmandoId, setConfirmandoId] = useState(null);

  async function cerrar(e) {
    e.preventDefault();
    setEnviando(true);
    setAviso(null);
    setAfectadas([]);
    try {
      const response = await apiFetch('/bloqueos', {
        method: 'POST',
        body: JSON.stringify({ fechaInicio: desde, fechaFin: hasta || desde, motivo })
      });
      if (!response.ok) {
        setAviso({ tipo: 'error', texto: await response.text() });
        return;
      }
      const { bloqueo, citasAfectadas } = await response.json();
      const unSoloDia = bloqueo.fechainicio === bloqueo.fechafin;
      setAviso({
        tipo: 'ok',
        texto: `Has cerrado ${unSoloDia ? 'el ' : ''}${formatearRango(bloqueo.fechainicio, bloqueo.fechafin)}. `
          + `Los pacientes ya no pueden reservar ${unSoloDia ? 'ese día' : 'esos días'}.`
      });
      setAfectadas(citasAfectadas);
      setDesde('');
      setHasta('');
      setMotivo('');
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
          <p className="texto-suave">Para vacaciones, festivos o cualquier día que no vayas a pasar consulta.</p>
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
          <div className="campo">
            <label htmlFor="cierre-motivo">Motivo</label>
            <input id="cierre-motivo" value={motivo} maxLength={100} placeholder="Ej: vacaciones"
              onChange={(e) => setMotivo(e.target.value)} aria-describedby="ayuda-motivo" />
            <small id="ayuda-motivo">Solo lo ves tú. Los pacientes solo verán que ese día no hay citas.</small>
          </div>
          <button type="submit" className="btn btn-primario" disabled={enviando || !desde}>
            {enviando ? 'Guardando…' : 'Cerrar estos días'}
          </button>
        </form>

        <div>
          <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

          {afectadas.length > 0 && (
            <div className="citas-afectadas" role="status">
              <p>
                <strong>
                  Ya había {afectadas.length === 1 ? '1 cita' : `${afectadas.length} citas`} esos días y siguen en pie.
                </strong>{' '}
                Cancélalas desde la agenda para que al paciente le llegue un correo:
              </p>
              <ul>
                {afectadas.map((cita) => {
                  const { dia, hora } = partesCita(cita.datetime);
                  return (
                    <li key={cita.id}>
                      <span>{capitalizar(dia)}, {hora} · {cita.nombre} {cita.apellidos}</span>
                      <a href={`tel:${cita.telefono}`}><Phone size={14} aria-hidden="true" /> {cita.telefono}</a>
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
            <p className="estado-vacio">No tienes ningún día cerrado.</p>
          ) : (
            <ul className="lista-cierres">
              {bloqueos.map((b) => (
                <li key={b.id}>
                  <div>
                    <span className="cierre-fechas">{capitalizar(formatearRango(b.fechainicio, b.fechafin))}</span>
                    {b.motivo && <span className="cierre-motivo">{b.motivo}</span>}
                  </div>
                  {confirmandoId === b.id ? (
                    <div className="confirmar-cancelacion">
                      <span>¿Abrir de nuevo?</span>
                      <button type="button" className="btn btn-primario btn-pequeno" onClick={() => abrir(b.id)}>Sí, abrir</button>
                      <button type="button" className="btn-texto" onClick={() => setConfirmandoId(null)}>No</button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => setConfirmandoId(b.id)}>
                      Volver a abrir
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
