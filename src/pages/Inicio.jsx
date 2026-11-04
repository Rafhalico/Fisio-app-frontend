import { Link } from 'react-router-dom';
import {
  HandHeart, Activity, Sparkles, CalendarCheck, Check,
  UserPlus, CalendarDays, Smile, MapPin, Phone, Clock, Navigation
} from 'lucide-react';
import Pagina from '../components/Pagina';
import { CLINICA, HORARIO } from '../datos/clinica';

const servicios = [
  { icono: HandHeart, titulo: 'Fisioterapia manual', texto: 'Técnicas especializadas para aliviar el dolor y mejorar la movilidad.' },
  { icono: Activity, titulo: 'Rehabilitación', texto: 'Recupera tu fuerza, movilidad y función tras una lesión.' },
  { icono: Sparkles, titulo: 'Terapias avanzadas', texto: 'Tratamientos innovadores adaptados a tus necesidades.' },
  { icono: CalendarCheck, titulo: 'Cita online', texto: 'Reserva tu cita de forma rápida y sencilla cuando quieras.' },
];

const pasos = [
  { icono: UserPlus, titulo: 'Crea tu cuenta', texto: 'Solo necesitas tu nombre, teléfono y email. Tardas un minuto.' },
  { icono: CalendarDays, titulo: 'Elige día y hora', texto: 'Mira los huecos libres en tiempo real y reserva el que mejor te venga.' },
  { icono: Smile, titulo: 'Ven a tu sesión', texto: 'Te esperamos en la clínica. Si te surge algo, cancela desde la web.' },
];

function Inicio() {
  return (
    <Pagina>
      <section className="hero">
        <div className="contenedor hero-interior">
          <div className="hero-texto">
            <p className="eyebrow">Fisioterapia en Gilena</p>
            <h1 className="hero-titulo">
              Recupera tu <span className="degradado">bienestar</span>
            </h1>
            <p className="hero-descripcion">
              Fisioterapia personalizada para aliviar el dolor, mejorar tu
              movilidad y ayudarte a sentirte mejor cada día.
            </p>
            <div className="hero-botones">
              <Link to="/reservar" className="btn btn-primario">Reservar cita</Link>
              <a href={CLINICA.telefonoEnlace} className="btn btn-secundario">
                <Phone size={18} aria-hidden="true" /> {CLINICA.telefono}
              </a>
            </div>
            <ul className="hero-confianza">
              <li><Check size={16} aria-hidden="true" /> Atención personalizada</li>
              <li><Check size={16} aria-hidden="true" /> Profesional especializada</li>
              <li><Check size={16} aria-hidden="true" /> Cercana y de confianza</li>
            </ul>
          </div>

          <div className="hero-imagen">
            <img
              src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80"
              alt="Fisioterapeuta tratando la espalda de una paciente"
              width="900"
              height="600"
              fetchPriority="high"
            />
            <div className="hero-sello">
              <span>Tu salud es nuestra</span>
              <strong>prioridad</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-servicios">
        <div className="contenedor">
          <p className="eyebrow centrado">Servicios</p>
          <h2 id="titulo-servicios" className="titulo-seccion">Cómo podemos ayudarte</h2>
          <div className="servicios">
            {servicios.map(({ icono: Icono, titulo, texto }) => (
              <article className="tarjeta servicio" key={titulo}>
                <span className="icono-circulo"><Icono size={24} aria-hidden="true" /></span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion seccion-suave" aria-labelledby="titulo-pasos">
        <div className="contenedor">
          <p className="eyebrow centrado">Cita online</p>
          <h2 id="titulo-pasos" className="titulo-seccion">Reservar es muy fácil</h2>
          <ol className="pasos">
            {pasos.map(({ icono: Icono, titulo, texto }, i) => (
              <li className="paso" key={titulo}>
                <span className="paso-icono">
                  <Icono size={28} aria-hidden="true" />
                  <span className="paso-numero">{i + 1}</span>
                </span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>
          <div className="centrado">
            <Link to="/reservar" className="btn btn-primario">Empezar ahora</Link>
          </div>
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-visitanos">
        <div className="contenedor">
          <p className="eyebrow centrado">Visítanos</p>
          <h2 id="titulo-visitanos" className="titulo-seccion">Horario y ubicación</h2>
          <div className="info-clinica">
            <div className="tarjeta">
              <h3 className="tarjeta-titulo"><Clock size={20} aria-hidden="true" /> Horario</h3>
              <table className="tabla-horario">
                <tbody>
                  {HORARIO.map(({ dia, franjas }) => (
                    <tr key={dia}>
                      <th scope="row">{dia}</th>
                      <td className={franjas.length ? '' : 'cerrado'}>
                        {franjas.length ? franjas.map((f) => <span key={f}>{f}</span>) : 'Cerrado'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tarjeta">
              <h3 className="tarjeta-titulo"><MapPin size={20} aria-hidden="true" /> Dónde estamos</h3>
              <p className="direccion">
                {CLINICA.direccion}<br />{CLINICA.localidad}
              </p>
              <div className="botones-columna">
                <a href={CLINICA.mapa} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
                  <Navigation size={18} aria-hidden="true" /> Cómo llegar
                </a>
                <a href={CLINICA.telefonoEnlace} className="btn btn-secundario">
                  <Phone size={18} aria-hidden="true" /> Llamar a la clínica
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="contenedor">
          <h2>¿Empezamos a cuidarte?</h2>
          <p>Reserva tu cita online en menos de un minuto.</p>
          <Link to="/reservar" className="btn btn-blanco">Reservar cita</Link>
        </div>
      </section>
    </Pagina>
  );
}

export default Inicio;
