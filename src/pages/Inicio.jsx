import { Link, useLocation } from 'react-router-dom';
import { HandHeart, Activity, Sparkles, CalendarCheck, MapPin, Phone, Navigation } from 'lucide-react';
import Pagina from '../components/Pagina';
import ProximosHuecos from '../components/ProximosHuecos';
import EstadoClinica from '../components/EstadoClinica';
import Aviso from '../components/Aviso';
import { CLINICA, HORARIO } from '../datos/clinica';

const servicios = [
  { icono: HandHeart, titulo: 'Fisioterapia manual', texto: 'Técnicas especializadas para aliviar el dolor y mejorar la movilidad.' },
  { icono: Activity, titulo: 'Rehabilitación', texto: 'Recupera tu fuerza, movilidad y función tras una lesión.' },
  { icono: Sparkles, titulo: 'Terapias avanzadas', texto: 'Tratamientos innovadores adaptados a tus necesidades.' },
  { icono: CalendarCheck, titulo: 'Cita online', texto: 'Reserva tu cita de forma rápida y sencilla cuando quieras.' },
];

// Estos sí son una secuencia, por eso van numerados.
const pasos = [
  { titulo: 'Crea tu cuenta', texto: 'Con tu nombre, teléfono y email. Te enviamos un código para confirmarla.' },
  { titulo: 'Elige día y hora', texto: 'Ves los huecos libres al momento y reservas el que te venga mejor.' },
  { titulo: 'Ven a tu sesión', texto: 'Si te surge algo, cancélala desde la web hasta 24 horas antes.' },
];

function Inicio() {
  const hoy = new Date().getDay();
  // Mensaje que llega de otra página (p. ej. "Tu cuenta se ha borrado")
  const avisoRecibido = useLocation().state?.aviso;

  return (
    <Pagina>
      <section className="portada">
        <div className="contenedor portada-interior">
          <div className="portada-texto">
            {avisoRecibido && <Aviso tipo="ok">{avisoRecibido}</Aviso>}
            <h1 className="portada-titulo">Fisioterapia cercana, aquí en Gilena</h1>
            <p className="portada-descripcion">
              Te atendemos en persona para aliviar el dolor, recuperarte de una lesión
              y moverte mejor. Reserva tu sesión online en un minuto o llámanos.
            </p>
            <div className="portada-botones">
              <Link to="/reservar" className="btn btn-primario">Reservar cita</Link>
              <a href={CLINICA.telefonoEnlace} className="btn btn-secundario">
                <Phone size={18} aria-hidden="true" /> {CLINICA.telefono}
              </a>
            </div>
            <EstadoClinica />
          </div>

          <ProximosHuecos />
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-servicios">
        <div className="contenedor servicios-bloque">
          <div className="servicios-intro">
            <h2 id="titulo-servicios">Cómo podemos ayudarte</h2>
            <p>
              Cada sesión empieza escuchándote: qué te duele, desde cuándo y qué quieres
              volver a hacer. A partir de ahí preparamos un tratamiento a tu medida.
            </p>
            <img
              src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80"
              alt="Fisioterapeuta tratando la espalda de una paciente"
              width="800" height="560" loading="lazy"
            />
          </div>

          <ul className="servicios-lista">
            {servicios.map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo}>
                <Icono size={26} className="servicio-icono" aria-hidden="true" />
                <div>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion seccion-blanca" aria-labelledby="titulo-pasos">
        <div className="contenedor">
          <h2 id="titulo-pasos" className="titulo-seccion">Así se reserva online</h2>
          <ol className="linea-pasos">
            {pasos.map(({ titulo, texto }, i) => (
              <li key={titulo}>
                <span className="linea-numero">{i + 1}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>
          <p className="centrado">
            <Link to="/reservar" className="btn btn-primario">Reservar cita</Link>
          </p>
        </div>
      </section>

      <section className="seccion" aria-labelledby="titulo-visitanos">
        <div className="contenedor visita">
          <div>
            <h2 id="titulo-visitanos">Horario</h2>
            <EstadoClinica />
            <table className="tabla-horario">
              <tbody>
                {HORARIO.map(({ dia, numeros, franjas }) => {
                  const esHoy = numeros.includes(hoy);
                  return (
                    <tr key={dia} className={esHoy ? 'hoy' : undefined} aria-current={esHoy ? 'date' : undefined}>
                      <th scope="row">{dia}{esHoy && <span className="marca-hoy">hoy</span>}</th>
                      <td className={franjas.length ? '' : 'cerrado'}>
                        {franjas.length ? franjas.map((f) => <span key={f}>{f}</span>) : 'Cerrado'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2>Dónde estamos</h2>
            <p className="direccion">
              <MapPin size={20} aria-hidden="true" />
              <span>{CLINICA.direccion}<br />{CLINICA.localidad}</span>
            </p>
            <div className="botones-fila izquierda">
              <a href={CLINICA.mapa} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
                <Navigation size={18} aria-hidden="true" /> Cómo llegar
              </a>
              <a href={CLINICA.telefonoEnlace} className="btn btn-secundario">
                <Phone size={18} aria-hidden="true" /> Llamar
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="contenedor cta-interior">
          <h2>¿Te duele algo? No lo dejes para más adelante.</h2>
          <div className="botones-fila">
            <Link to="/reservar" className="btn btn-blanco">Reservar cita</Link>
            <a href={CLINICA.telefonoEnlace} className="btn btn-borde-blanco">
              <Phone size={18} aria-hidden="true" /> Llamar
            </a>
          </div>
        </div>
      </section>
    </Pagina>
  );
}

export default Inicio;
