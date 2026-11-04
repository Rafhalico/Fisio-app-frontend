import { useState } from 'react';
import { Clock } from 'lucide-react';
import { partesCita, capitalizar } from '../utils/fechas';

// Tarjeta de una cita. La usan "Mis citas" (paciente) y "Mi agenda" (fisio).
// - detalle: contenido extra debajo del motivo (p. ej. nombre y teléfono del paciente)
// - estado: etiqueta opcional ("Cancelada", "Realizada"...)
// - onCancelar: si se pasa, muestra el botón de cancelar con confirmación
// - vistaDia: en la agenda el día ya sale arriba, así que el bloque muestra la hora
//   y la línea principal pasa a ser "titulo" (el nombre del paciente)
// - pedirMotivo: al cancelar, muestra un campo para escribir el motivo (lo usa la fisio;
//   el motivo le llega al paciente por correo). onCancelar recibe (id, motivo).
function CitaCard({ cita, detalle, estado, onCancelar, vistaDia = false, titulo, pedirMotivo = false }) {
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const { dia, hora, numero, mes } = partesCita(cita.datetime);

  async function confirmar() {
    setCancelando(true);
    await onCancelar(cita.id, motivo.trim());
    setCancelando(false);
    setConfirmando(false);
    setMotivo('');
  }

  return (
    <article className={estado ? 'cita-card atenuada' : 'cita-card'}>
      {vistaDia ? (
        <div className="cita-calendario cita-bloque-hora">
          <span className="cita-numero">{hora}</span>
        </div>
      ) : (
        <div className="cita-calendario" aria-hidden="true">
          <span className="cita-mes">{mes}</span>
          <span className="cita-numero">{numero}</span>
        </div>
      )}

      <div className="cita-info">
        {vistaDia ? (
          <p className="cita-fecha">{titulo}</p>
        ) : (
          <p className="cita-fecha">
            {capitalizar(dia)} <span className="cita-hora"><Clock size={14} aria-hidden="true" /> {hora}</span>
          </p>
        )}
        {cita.motivo && <p className="cita-motivo">{cita.motivo}</p>}
        {detalle}
      </div>

      <div className="cita-acciones">
        {estado && <span className={`etiqueta etiqueta-${estado.toLowerCase()}`}>{estado}</span>}
        {onCancelar && !confirmando && (
          <button type="button" className="btn btn-peligro-borde btn-pequeno" onClick={() => setConfirmando(true)}>
            Cancelar
          </button>
        )}
        {onCancelar && confirmando && (
          <div className={pedirMotivo ? 'confirmar-cancelacion con-motivo' : 'confirmar-cancelacion'} role="group" aria-label="Confirmar cancelación">
            <span>¿Cancelar esta cita?</span>
            {pedirMotivo && (
              <input
                className="input-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={200}
                placeholder="Motivo (le llegará al paciente)"
                aria-label="Motivo de la cancelación"
                autoFocus
              />
            )}
            <button type="button" className="btn btn-peligro btn-pequeno" onClick={confirmar} disabled={cancelando}>
              {cancelando ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
            <button type="button" className="btn-texto" onClick={() => setConfirmando(false)} disabled={cancelando}>
              No
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default CitaCard;
