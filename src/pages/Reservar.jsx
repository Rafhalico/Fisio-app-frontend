import {useState} from 'react'
import {Link} from 'react-router-dom';
import Calendario from '../components/Calendario';
import {useNavigate} from 'react-router-dom';
import Footer from '../components/Footer';
import { apiFetch } from '../api';
import { cerrarSesion } from '../sesion';

function Reservar() {
    const [fecha, setFecha] = useState ('');
    const [disponibilidad, setDisponibilidad] = useState ([]);
    const [motivo, setMotivo] = useState('');
    const [mensajeReserva, setMensajeReserva] = useState('');
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const navigate= useNavigate();

async function cargarDisponibilidad(fechaElegida) {
  const response = await apiFetch(`/appointments/available?fecha=${fechaElegida}`);

  if (!response.ok) {
    const errorTexto = await response.text();
    console.log(errorTexto);
    return;
  }

  const data = await response.json();
  setDisponibilidad(data);
}

async function handleReservar() {
    const datetime = `${fecha} ${horaSeleccionada}`;
    // Ya no mandamos idPaciente: el servidor lo saca del token.
    const response = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
            datetime: datetime,
            motivo: motivo
        })
    });
    const data = await response.text();
    setMensajeReserva(data);
    cargarDisponibilidad(fecha);
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

    <section className="reservar-hero">
      <div className="reservar-hero-texto">
        <h1 className="reservar-titulo">Reservar cita</h1>
        <p className="reservar-subtitulo">
          Selecciona la fecha y la hora que mejor se adapte a ti.
        </p>
      </div>
      <div className="reservar-hero-imagen">
        <img
          src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80"
          alt="Sala de fisioterapia"
        />
      </div>
    </section>

    <section className="reservar-panel">
      <div className="reservar-columna">
        <h3>1. Selecciona la fecha</h3>
        <Calendario
          fechaSeleccionada={fecha}
          onSeleccionarFecha={(nuevaFecha) => {
            setFecha(nuevaFecha);
            cargarDisponibilidad(nuevaFecha);
          }}
        />
      </div>

      <div className="reservar-columna">
        <h3>2. Selecciona la hora</h3>
        <div className="horas-grid">
          {disponibilidad.map((item) =>
            <button
              key={item.hora}
              className={item.huecosLibres > 0 ? "hora-disponible" : "hora-agotada"}
              disabled={item.huecosLibres === 0}
              onClick={() => setHoraSeleccionada(item.hora)}
            >
              {item.hora}
              <span className="huecos-info">{item.huecosLibres} libres</span>
            </button>
          )}
        </div>

        <label>Motivo de la consulta</label>
        <input
          placeholder="Ej: Dolor de espalda"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <p className="mensaje-feedback">{mensajeReserva}</p>
        {horaSeleccionada &&
  <div className="resumen-reserva">
    <p>Vas a reservar: <strong>{fecha} a las {horaSeleccionada}</strong></p>
    <button className="btn-degradado" onClick={handleReservar}>Confirmar cita</button>
  </div>
}
      </div>
      <div className="reservar-decoracion-inferior"></div>
    </section>
    <Footer />
  </>
)
}
export default Reservar 