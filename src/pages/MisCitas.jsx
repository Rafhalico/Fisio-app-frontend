import { useState } from 'react';
import {Link} from 'react-router-dom';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Footer from '../components/Footer';

function MisCitas() {
    const [citas, setCitas] = useState([]);
    const [pestaña, setPestaña] = useState('proximas');
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = JSON.parse(usuarioGuardado);
    const navigate= useNavigate();

useEffect(() => {
  if(!usuario){
    navigate('/acceso');
  }
}, []);

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

    useEffect(() => {
        cargarCitas();
    }, []);

    async function cargarCitas() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/paciente/${usuario.id}`);
        const data = await response.json();
        setCitas(data);
    }

    async function handleCancelar(idCita){
     
    const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${idCita}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ quienCancela: 'paciente' })
            
         });
         const data = await response.text();
         console.log(data);
         cargarCitas();
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
        localStorage.removeItem('usuario');
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