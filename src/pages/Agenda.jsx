import { useEffect, useState } from 'react';
import { Phone, User, CalendarOff, PhoneIncoming } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import Calendario from '../components/Calendario';
import CitaCard from '../components/CitaCard';
import Aviso from '../components/Aviso';
import DiasCerrados from '../components/DiasCerrados';
import NuevaCita from '../components/NuevaCita';
import { apiFetch, ERROR_CONEXION } from '../api';
import { obtenerUsuario } from '../sesion';
import { hoyTexto, formatearDia, capitalizar, diasDelRango } from '../utils/fechas';

// Agenda compartida: las dos fisios ven todas las citas de la clínica y se las reparten
// con el desplegable "Asignar a" (cualquiera de las dos puede asignar a cualquiera).
function Agenda() {
  const usuario = obtenerUsuario();
  // Al entrar se muestra directamente el día de hoy.
  const [fecha, setFecha] = useState(hoyTexto());
  const [dia, setDia] = useState({ citas: [], huecos: [], plazas: 0, fisios: [] });
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [bloqueos, setBloqueos] = useState([]);
  const [plazasPorHora, setPlazasPorHora] = useState(2);
  const [recargaBloqueos, setRecargaBloqueos] = useState(0);

  useEffect(() => {
    let activo = true;
    apiFetch('/bloqueos')
      .then((response) => (response.ok ? response.json() : { bloqueos: [] }))
      .then((data) => {
        if (!activo) return;
        setBloqueos(data.bloqueos);
        if (data.plazasPorHora) setPlazasPorHora(data.plazasPorHora);
      })
      .catch(() => {});
    return () => { activo = false; };
  }, [recargaBloqueos]);

  // Días con algún cierre, para marcarlos en el calendario, y los cierres del día que se está viendo.
  const diasCerrados = new Set(bloqueos.flatMap((b) => diasDelRango(b.fechainicio, b.fechafin)));
  const cierresDelDia = bloqueos.filter((b) => fecha >= b.fechainicio && fecha <= b.fechafin);
  const motivos = cierresDelDia.map((b) => b.motivo).filter(Boolean).join(', ');

  function elegirFecha(nuevaFecha) {
    setFecha(nuevaFecha);
    setCargando(true);
    setAviso(null);
  }

  function irADia(nuevaFecha) {
    elegirFecha(nuevaFecha);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    let activo = true;
    apiFetch(`/appointments?fecha=${fecha}`)
      .then((response) => (response.ok ? response.json() : { citas: [], huecos: [], plazas: 0, fisios: [] }))
      .then((data) => { if (activo) setDia(data); })
      .catch(() => { if (activo) setAviso({ tipo: 'error', texto: ERROR_CONEXION }); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [fecha, recarga, recargaBloqueos]);

  // Cualquier fisio puede cancelar cualquier cita, sin la restricción de 24 h (lo controla el servidor).
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

  // Asignar la cita a una fisio, o dejarla sin asignar (idFisio = '')
  async function handleAsignar(idCita, idFisio) {
    try {
      const response = await apiFetch(`/appointments/${idCita}/asignar`, {
        method: 'PUT',
        body: JSON.stringify({ idFisio: idFisio === '' ? null : Number(idFisio) })
      });
      setAviso(response.ok ? null : { tipo: 'error', texto: await response.text() });
      setRecarga((n) => n + 1);
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    }
  }

  const { citas, huecos, plazas, fisios } = dia;
  const numero = citas.length;

  return (
    <Pagina titulo="Agenda">
      <CabeceraPagina
        titulo="Agenda de la clínica"
        subtitulo={`Hola, ${usuario.nombre}. Aquí veis los dos todas las citas; repartidlas con «Asignar a».`}
      />

      <section className="contenedor panel-flotante">
        <div className="tarjeta panel-dos-columnas agenda">
          <div>
            <Calendario fechaSeleccionada={fecha} onSeleccionarFecha={elegirFecha} permitirPasado diasMarcados={diasCerrados} />
            <button type="button" className="btn-texto" onClick={() => elegirFecha(hoyTexto())}>
              Volver a hoy
            </button>
          </div>

          <div>
            <div className="agenda-cabecera">
              <h2>{capitalizar(formatearDia(fecha))}</h2>
              {!cargando && <span className="contador grande">{numero} {numero === 1 ? 'cita' : 'citas'}</span>}
            </div>

            {!cargando && (
              <NuevaCita
                key={fecha}
                fecha={fecha}
                huecos={huecos}
                plazas={plazas}
                fisios={fisios}
                idUsuario={usuario.id}
                onCreada={(texto) => { setAviso({ tipo: 'ok', texto }); setRecarga((n) => n + 1); }}
              />
            )}

            {!cargando && huecos.length > 0 && plazas < plazasPorHora && (
              <p className="banda-cerrado">
                <CalendarOff size={18} aria-hidden="true" />
                {plazas === 0
                  ? 'La clínica está cerrada este día. Los pacientes no pueden reservar.'
                  : `Este día solo trabaja un fisio: ${plazas} hueco por hora.`}
                {motivos && ` (${motivos})`}
              </p>
            )}

            {!cargando && plazas > 0 && huecos.length > 0 && (
              <ul className="huecos-dia-agenda" aria-label="Huecos ocupados por hora">
                {huecos.map(({ hora, ocupadas }) => (
                  <li key={hora} className={ocupadas >= plazas ? 'lleno' : ocupadas > 0 ? 'medio' : ''}>
                    <span>{hora}</span>
                    <small>{ocupadas}/{plazas}</small>
                  </li>
                ))}
              </ul>
            )}

            <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

            {cargando ? (
              <p className="estado-vacio">Cargando agenda…</p>
            ) : numero === 0 ? (
              <p className="estado-vacio">No hay citas este día.</p>
            ) : (
              <div className="lista-citas">
                {citas.map((cita) => (
                  <CitaCard
                    key={cita.id}
                    cita={cita}
                    onCancelar={handleCancelar}
                    pedirMotivo={!cita.manual}
                    vistaDia
                    titulo={
                      <>
                        <User size={15} aria-hidden="true" /> {cita.nombre} {cita.apellidos}
                        {cita.manual && (
                          <span className="etiqueta etiqueta-manual" title="Apuntada desde la agenda (teléfono, WhatsApp o en persona)">
                            <PhoneIncoming size={12} aria-hidden="true" /> Apuntada a mano
                          </span>
                        )}
                      </>
                    }
                    detalle={
                      <div className="cita-paciente">
                        {cita.telefono
                          ? <a href={`tel:${cita.telefono}`}><Phone size={14} aria-hidden="true" /> {cita.telefono}</a>
                          : <span className="texto-suave">Sin teléfono</span>}
                        <label className={cita.idfisio ? 'asignar asignada' : 'asignar'}>
                          <span>{cita.idfisio ? 'La atiende' : 'Asignar a'}</span>
                          <select
                            value={cita.idfisio ?? ''}
                            onChange={(e) => handleAsignar(cita.id, e.target.value)}
                            aria-label={`Asignar la cita de ${cita.nombre} a`}
                          >
                            <option value="">Sin asignar</option>
                            {fisios.map((f) => (
                              <option key={f.id} value={f.id}>{f.id === usuario.id ? `${f.nombre} (tú)` : f.nombre}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      }
                    />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <DiasCerrados
        bloqueos={bloqueos}
        plazasPorHora={plazasPorHora}
        onCambio={() => setRecargaBloqueos((n) => n + 1)}
        onIrADia={irADia}
      />
    </Pagina>
  );
}

export default Agenda;
