import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { obtenerUsuario, cerrarSesion } from '../sesion';

// Barra de navegación única para toda la web.
// Cambia según quién esté mirando: visitante, paciente o fisio.
function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const usuario = obtenerUsuario();
  const navigate = useNavigate();

  const cerrarMenu = () => setAbierto(false);
  const claseEnlace = ({ isActive }) => (isActive ? 'nav-enlace activo' : 'nav-enlace');

  function salir() {
    cerrarSesion();
    cerrarMenu();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-interior">
        <Link to={usuario?.rol === 'fisio' ? '/agenda' : '/'} className="logo" onClick={cerrarMenu}>
          <span className="logo-nombre">María Montaño</span>
          <span className="logo-sub">Fisioterapia</span>
        </Link>

        <button
          className="navbar-hamburguesa"
          onClick={() => setAbierto(!abierto)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={abierto ? 'navbar-enlaces abierto' : 'navbar-enlaces'} onClick={cerrarMenu}>
          {usuario?.rol === 'fisio' ? (
            <>
              <NavLink to="/agenda" className={claseEnlace}>Mi agenda</NavLink>
              <NavLink to="/perfil" className={claseEnlace}>Mi perfil</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={claseEnlace}>Inicio</NavLink>
              {usuario && <NavLink to="/mis-citas" className={claseEnlace}>Mis citas</NavLink>}
              {usuario && <NavLink to="/perfil" className={claseEnlace}>Mi perfil</NavLink>}
              {!usuario && <NavLink to="/acceso" className={claseEnlace}>Acceder</NavLink>}
              <NavLink to="/reservar" className="btn btn-primario btn-pequeno">Reservar cita</NavLink>
            </>
          )}

          {usuario && (
            <div className="navbar-usuario">
              <span className="navbar-saludo">Hola, {usuario.nombre}</span>
              <button className="btn-texto" onClick={salir}>
                <LogOut size={16} aria-hidden="true" /> Salir
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
