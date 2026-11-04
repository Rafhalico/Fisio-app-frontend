import { useState } from 'react';
import {Link} from 'react-router-dom';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Footer from '../components/Footer';
import { apiFetch } from '../api';
import { cerrarSesion } from '../sesion';

function MisCitas() {
    const [citas, setCitas] = useState([]);
    const [pestaña, setPestaña] = useState('proximas');
    const [mensaje, setMensaje] = useState('');
    const navigate= useNavigate();

    function citasFiltradas() {
  const ahora = new Date();

  if (pestaña === 'proximas') {
    return citas.filter(c => c.estado === 'reservada' && new Date(c.datetime) >= ahora);
  }
  if (pestaña === 'canceladas') {
    return citas.filter(c => c.estado === 'cancelada');
  }
  return citas.filter(c => c.estado === 'reservada' && new Date(c.datetime) < ahora);
}

    // Cada vez que cambia "recarga" se vuelven a pedir las citas (p. ej. tras cancelar una).
    const [recarga, setRecarga] = useState(0);

    useEffect(() => {
        // "activo" evita actualizar el estado si la página se cierra antes de que llegue la respuesta.
        let activo = true;
        apiFetch('/appointments/mias')
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => { if (activo) setCitas(data); });
        return () => { activo = false; };
    }, [recarga]);

    async function handleCancelar(idCita){
        // Ya no se manda quienCancela: el servidor lo deduce del rol del token.
        const response = await apiFetch(`/appointments/${idCita}`, { method: 'PUT' });
        // Antes el mensaje solo iba a la consola; ahora se muestra (p. ej. la regla de 24 h).
        setMensaje(await response.text());
        setRecarga((n) => n + 1);
    }

    return (
  <>
    <nav className="navbar">
  <div className="logo">
    <span className="logo-nombre">María Montaño</span>
    <span className="logo-sub">FISIOTERAPIA</span>
  </div>
    <div className="navbar-links">
    <Link to="/" className="btn-nav">Inicio</Link>
    <Link to="/mis-citas" className="btn-nav">Mis citas</Link>
    <Link to="/reservar" className="btn-nav">Reservar cita</Link>
    <button
      className="btn-nav"
      onClick={() => {
        cerrarSesion();
        navigate('/');
      }}
    >
      Cerrar sesión
    </button>
  </div>
</nav>

    <section className="miscitas-hero">
      <div className="miscitas-hero-texto">
        <h1 className="miscitas-titulo">Mis citas</h1>
        <p className="miscitas-subtitulo">
          Consulta tus próximas citas, revisa tu historial o cancela una cita si lo necesitas.
        </p>
      </div>
      <div className="miscitas-hero-imagen">
        <img
          src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
          alt="Consulta de fisioterapia"
        />
      </div>
    </section>

    <section className="miscitas-panel">
      <div className="miscitas-tabs">
        <button
          className={pestaña === 'proximas' ? "tab-activa" : "tab"}
          onClick={() => setPestaña('proximas')}
        >
          Próximas citas
        </button>
        <button
          className={pestaña === 'historial' ? "tab-activa" : "tab"}
          onClick={() => setPestaña('historial')}
        >
          Historial
        </button>
        <button
          className={pestaña === 'canceladas' ? "tab-activa" : "tab"}
          onClick={() => setPestaña('canceladas')}
        >
          Canceladas
        </button>
      </div>

      <p className="mensaje-feedback">{mensaje}</p>
      <div className="miscitas-lista">
        {citasFiltradas().length === 0 &&
          <p className="miscitas-vacio">No hay citas en esta categoría.</p>
        }
        {citasFiltradas().map((item) =>
          <div className="cita-card" key={item.id}>
            <div className="cita-info">
              <span className="cita-fecha">{item.datetime}</span>
              <span className="cita-motivo">{item.motivo}</span>
            </div>
            {pestaña === 'proximas' &&
              <button className="btn-cancelar" onClick={() => handleCancelar(item.id)}>
                Cancelar cita
              </button>
            }
          </div>
        )}
      </div>
    </section>
    <Footer />
  </>
  
)
}
export default MisCitas