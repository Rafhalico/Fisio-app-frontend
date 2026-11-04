import { estadoClinica } from '../utils/horario';

// Punto verde o gris con "Abierto ahora, cierra a las 21:00" / "Cerrado ahora, abre mañana...".
// Útil sobre todo junto al teléfono: así se sabe si merece la pena llamar ya.
function EstadoClinica() {
  const { abierto, texto } = estadoClinica();
  return (
    <span className={abierto ? 'estado-clinica abierto' : 'estado-clinica'}>
      <span className="estado-punto" aria-hidden="true" />
      {texto}
    </span>
  );
}

export default EstadoClinica;
