import { CircleAlert, CircleCheck, Info } from 'lucide-react';

const iconos = { error: CircleAlert, ok: CircleCheck, info: Info };

// Mensaje de estado (error, éxito o información).
// role="alert" hace que los lectores de pantalla lo anuncien al aparecer.
function Aviso({ tipo = 'info', children }) {
  if (!children) return null;
  const Icono = iconos[tipo];
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export default Aviso;
