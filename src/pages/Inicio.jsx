import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

function Inicio() {
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
</div>
</nav>

      <section className="hero">
        <div className="hero-texto">
          <p className="hero-eyebrow">CUIDAMOS DE TI, MEJORAMOS TU VIDA</p>
          <h1 className="hero-titulo">
            Recupera tu <span className="degradado">bienestar</span>
          </h1>
          <p className="hero-descripcion">
            Fisioterapia personalizada para aliviar el dolor, mejorar tu
            movilidad y ayudarte a sentirte mejor cada día.
          </p>
        <div className="hero-botones">
            <Link to="/reservar" className="btn-primario">Reservar cita</Link>
            <a href="tel:626446019" className="btn-secundario">Contactar</a>
        </div>

        <div className="hero-confianza">
            <span>✓ Atención personalizada</span>
             <span>✓ Profesional especializada</span>
              <span>✓ Cercana y de confianza</span>
         </div>
         </div>

        <div className="hero-imagen">
          <img
            src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80"
            alt="Sesión de fisioterapia"
          />
          <div className="hero-quote">
            <p>Tu salud es nuestra <strong>prioridad</strong></p>
          </div>
        </div>
      </section>

      <section className="servicios">
        <div className="servicio-card">
          <h3>Fisioterapia manual</h3>
          <p>Técnicas especializadas para aliviar el dolor y mejorar la movilidad.</p>
        </div>
        <div className="servicio-card">
          <h3>Rehabilitación</h3>
          <p>Recupera tu fuerza, movilidad y función tras una lesión.</p>
        </div>
        <div className="servicio-card">
          <h3>Terapias avanzadas</h3>
          <p>Tratamientos innovadores adaptados a tus necesidades.</p>
        </div>
        <div className="servicio-card">
          <h3>Cita online</h3>
          <p>Reserva tu cita de forma rápida y sencilla cuando quieras.</p>
        </div>
      </section>
      <Footer />
    </>
  );
}
export default Inicio;