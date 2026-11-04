import { MapPin, Phone, Mail, AtSign, Clock } from 'lucide-react';
import { CLINICA, HORARIO } from '../datos/clinica';

function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor footer-columnas">
        <div className="footer-columna">
          <span className="logo-nombre">María Montaño</span>
          <span className="logo-sub">Fisioterapia</span>
          <p className="footer-lema">Cuidamos de ti, mejoramos tu vida.</p>
        </div>

        <div className="footer-columna">
          <h2>Dónde estamos</h2>
          <a href={CLINICA.mapa} target="_blank" rel="noopener noreferrer" className="footer-dato">
            <MapPin size={16} aria-hidden="true" />
            <span>{CLINICA.direccion}<br />{CLINICA.localidad}</span>
          </a>
        </div>

        <div className="footer-columna">
          <h2>Contacto</h2>
          <a href={CLINICA.telefonoEnlace} className="footer-dato">
            <Phone size={16} aria-hidden="true" /> {CLINICA.telefono}
          </a>
          <a href={`mailto:${CLINICA.email}`} className="footer-dato footer-email">
            <Mail size={16} aria-hidden="true" /> <span>{CLINICA.email.replace('@', '​@')}</span>
          </a>
          <a href={`https://instagram.com/${CLINICA.instagram}`} target="_blank" rel="noopener noreferrer" className="footer-dato">
            <AtSign size={16} aria-hidden="true" /> Instagram: {CLINICA.instagram}
          </a>
        </div>

        <div className="footer-columna">
          <h2>Horario</h2>
          <ul className="footer-horario">
            {HORARIO.map(({ dia, franjas }) => (
              <li key={dia}>
                <Clock size={14} aria-hidden="true" />
                <span><strong>{dia}:</strong> {franjas.length ? franjas.join(' y ') : 'Cerrado'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} {CLINICA.nombre}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
