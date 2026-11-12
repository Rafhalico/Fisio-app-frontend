import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { CLINICA } from '../datos/clinica';
import { obtenerUsuario } from '../sesion';

// Botón flotante para escribir a la clínica por WhatsApp.
// No sale a las fisios ni al administrador mientras trabajan (agenda y administración).
function BotonWhatsApp() {
  const { pathname } = useLocation();
  const usuario = obtenerUsuario();
  if (usuario?.rol === 'fisio' || pathname.startsWith('/agenda') || pathname.startsWith('/admin')) return null;

  return (
    <a href={CLINICA.whatsapp} target="_blank" rel="noopener noreferrer" className="boton-whatsapp"
      aria-label="Escríbenos por WhatsApp (se abre en una ventana nueva)">
      <MessageCircle size={24} aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}

export default BotonWhatsApp;
