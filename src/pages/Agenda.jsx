import {useState} from 'react'
import {Link} from 'react-router-dom';
import Calendario from '../components/Calendario';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function Agenda() {
    const [fecha, setFecha] = useState ('');
    const [citas, setCitas] = useState([]);
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = JSON.parse(usuarioGuardado);
    const navigate= useNavigate();

useEffect(() => {
  if(!usuario){
    navigate('/acceso');
  }
}, []);

    async function cargarAgenda(fechaElegida){
        const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments?fecha=${fechaElegida}&idFisio=${usuario.id}`);
        const data = await response.json();
        setCitas(data);

    }
    return (
  <>
    <nav className="navbar">
      <div className="logo">
        <span className="logo-nombre">María Montaño</span>
        <span className="logo-sub">FISIOTERAPIA</span>
      </div>
      <div className="navbar-links">
        <span>Hola, {usuario.nombre}</span>
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

    <section className="reservar-hero">
      <div className="reservar-hero-texto">
        <h1 className="reservar-titulo">Mi agenda</h1>
        <p className="reservar-subtitulo">
          Consulta las citas de tus pacientes cada día.
        </p>
      </div>
    </section>

    <section className="reservar-panel">
      <div className="reservar-columna">
        <h3>Selecciona un día</h3>
        <Calendario
          fechaSeleccionada={fecha}
          onSeleccionarFecha={(nuevaFecha) => {
            setFecha(nuevaFecha);
            cargarAgenda(nuevaFecha);
          }}
        />
      </div>

      <div className="reservar-columna">
        <h3>Citas del día</h3>
        {citas.length === 0 &&
          <p className="miscitas-vacio">No hay citas ese día.</p>
        }
        {citas.map((item) =>
          <div className="cita-card" key={item.id}>
            <div className="cita-info">
              <span className="cita-fecha">{item.datetime}</span>
              <span className="cita-motivo">{item.nombre} {item.apellidos} — {item.motivo}</span>
              <span className="cita-motivo">Tel: {item.telefono}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  </>
)
}
export default Agenda