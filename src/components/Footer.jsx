function Footer() {
  return (
    <footer className="footer">
      <div className="footer-columna">
        <div className="logo">
          <span className="logo-nombre-footer">María Montaño</span>
          <span className="logo-sub-footer">FISIOTERAPIA</span>
        </div>
        <p>Cuidamos de ti, mejoramos tu vida.</p>
      </div>

      <div className="footer-columna">
        <h4>Ubicación</h4>
        <p>C. La Cruz, 26, bajo</p>
        <p>41565 Gilena, Sevilla</p>
      </div>

      <div className="footer-columna">
        <h4>Contacto</h4>
        <p><a href="tel:626446019">626 44 60 19</a></p>
        <p><a href="mailto:fisioterapiamariamongarcia@gmail.com">fisioterapiamariamongarcia@gmail.com</a></p>
      </div>

      <div className="footer-columna">
        <h4>Síguenos</h4>
        <a href="https://instagram.com/mariamgfisioterapia" target="_blank" className="footer-instagram">
          @mariamgfisioterapia
        </a>
      </div>

      <div className="footer-copyright">
        <p>© 2026 María Montaño Fisioterapia. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;