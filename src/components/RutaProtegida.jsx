import { Navigate, useLocation } from 'react-router-dom';
import { obtenerUsuario } from '../sesion';

// Envuelve una página que necesita sesión (y opcionalmente un rol concreto).
// Comprueba ANTES de pintar la página, así nunca se renderiza con usuario null
// (que era lo que dejaba la pantalla en blanco).
// Es solo comodidad para el usuario: la seguridad real la pone el backend.
function RutaProtegida({ rol, children }) {
  const usuario = obtenerUsuario();
  const location = useLocation();

  if (!usuario) {
    // Guardamos a dónde quería ir (con su ?fecha=...&hora=...) para volver tras el login.
    return <Navigate to="/acceso" replace state={{ desde: location.pathname + location.search }} />;
  }

  if (rol && usuario.rol !== rol) {
    // Cada rol a su página principal: la fisio a su agenda, el paciente a reservar.
    return <Navigate to={usuario.rol === 'fisio' ? '/agenda' : '/reservar'} replace />;
  }

  return children;
}

export default RutaProtegida;
