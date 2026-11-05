import { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import Aviso from './Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { hoyTexto } from '../utils/fechas';

// Formulario de la agenda para apuntar una cita a mano: pacientes que llaman por teléfono,
// escriben por WhatsApp o vienen en persona. Ocupa un hueco igual que una reserva de la web,
// así nunca puede haber más pacientes que huecos a la misma hora.
// También sirve para bloquear una hora suelta (por ejemplo, nombre "Reunión").
// Props:
// - fecha: día que se está viendo en la agenda ("AAAA-MM-DD")
// - huecos: [{ hora, ocupadas }] de ese día;  plazas: huecos por hora ese día
// - fisios: [{ id, nombre }] para "Asignar a";  idUsuario: la fisio que ha iniciado sesión
// - onCreada(texto): avisa a la agenda para que recargue y muestre el mensaje
function NuevaCita({ fecha, huecos, plazas, fisios, idUsuario, onCreada }) {
  const [abierto, setAbierto] = useState(false);
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [motivo, setMotivo] = useState('');
  const [idFisio, setIdFisio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const esHoy = fecha === hoyTexto();
  // Horas con algún hueco libre. Hoy se pueden apuntar también horas ya empezadas
  // (alguien que entra sin cita), así que no se filtran por la hora actual.
  const libres = huecos.filter((h) => h.ocupadas < plazas);

  if (fecha < hoyTexto() || plazas === 0) return null;

  function cerrar() {
    setAbierto(false);
    setError(null);
  }

  async function guardar(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const response = await apiFetch('/appointments/manual', {
        method: 'POST',
        body: JSON.stringify({ datetime: `${fecha} ${hora}`, nombre, telefono, motivo, idFisio })
      });
      const texto = await response.text();
      if (!response.ok) {
        setError(texto);
        return;
      }
      setHora('');
      setNombre('');
      setTelefono('');
      setMotivo('');
      setIdFisio('');
      setAbierto(false);
      onCreada(texto);
    } catch {
      setError(ERROR_CONEXION);
    } finally {
      setEnviando(false);
    }
  }

  if (!abierto) {
    return (
      <button type="button" className="btn btn-secundario btn-pequeno btn-nueva-cita" onClick={() => setAbierto(true)}
        disabled={libres.length === 0} title={libres.length === 0 ? 'No quedan huecos libres este día' : undefined}>
        <CalendarPlus size={16} aria-hidden="true" />
        {libres.length === 0 ? 'Día completo' : 'Añadir cita'}
      </button>
    );
  }

  return (
    <form className="formulario nueva-cita" onSubmit={guardar} aria-labelledby="titulo-nueva-cita">
      <div className="nueva-cita-cabecera">
        <h3 id="titulo-nueva-cita">Añadir cita</h3>
        <button type="button" className="btn-icono" onClick={cerrar} aria-label="Cerrar sin guardar">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="texto-suave">Para pacientes que llaman, escriben por WhatsApp o vienen en persona. Ocupa un hueco igual que una reserva de la web.</p>

      <div className="campos-fila">
        <div className="campo">
          <label htmlFor="nueva-hora">Hora</label>
          <select id="nueva-hora" value={hora} onChange={(e) => setHora(e.target.value)} required>
            <option value="" disabled>Elige hora</option>
            {libres.map((h) => (
              <option key={h.hora} value={h.hora}>
                {h.hora} · {plazas - h.ocupadas} {plazas - h.ocupadas === 1 ? 'libre' : 'libres'}
              </option>
            ))}
          </select>
          {esHoy && <small>Hoy puedes apuntar también una hora ya empezada.</small>}
        </div>
        <div className="campo">
          <label htmlFor="nueva-fisio">La atiende</label>
          <select id="nueva-fisio" value={idFisio} onChange={(e) => setIdFisio(e.target.value)}>
            <option value="">Sin asignar</option>
            {fisios.map((f) => (
              <option key={f.id} value={f.id}>{f.id === idUsuario ? `${f.nombre} (tú)` : f.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="campos-fila">
        <div className="campo">
          <label htmlFor="nueva-nombre">Nombre y apellidos</label>
          <input id="nueva-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} required
            autoComplete="off" placeholder="Ej: Juan García" />
        </div>
        <div className="campo">
          <label htmlFor="nueva-telefono">Teléfono <span className="opcional">(opcional)</span></label>
          <input id="nueva-telefono" type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
            maxLength={20} autoComplete="off" placeholder="600 000 000" />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="nueva-motivo">Motivo <span className="opcional">(opcional)</span></label>
        <input id="nueva-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={200}
          placeholder="Ej: dolor de espalda, revisión…" />
      </div>

      <Aviso tipo="error">{error}</Aviso>

      <div className="nueva-cita-botones">
        <button type="submit" className="btn btn-primario" disabled={enviando || !hora || !nombre.trim()}>
          {enviando ? 'Guardando…' : 'Guardar cita'}
        </button>
        <button type="button" className="btn-texto" onClick={cerrar}>Cancelar</button>
      </div>
    </form>
  );
}

export default NuevaCita;
