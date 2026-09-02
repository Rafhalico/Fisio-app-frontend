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
          <a href="https://www.google.com/maps/place/Fisioterapia+Mar%C3%ADa+Monta%C3%B1o/@37.2515137,-4.9159627,19z/data=!3m1!4b1!4m6!3m5!1s0xd6d5784606c3e25:0x65582221a836c2ba!8m2!3d37.2515137!4d-4.9153176!16s%2Fg%2F11s854l6b2?entry=ttu&g_ep=EgoyMDI2MDgzMC4wIKXMDSoASAFQAw%3D%3D" target="_blank">
        <p>C. La Cruz, 26, bajo</p>
        <p>41565 Gilena, Sevilla</p>
        </a>
      </div>

      <div className="footer-columna">
        <h4>Contacto</h4>
        <p><a href="tel:626446019">626 44 60 19</a></p>
        <p><a href="mailto:fisioterapiamariamongarcia@gmail.com">fisioterapiamariamongarcia@gmail.com</a></p>
      </div>

      <div className="footer-columna">
        <h4>Síguenos</h4>
        <a href="https://instagram.com/fisioterapia_mmg" target="_blank" className="footer-instagram">
          @fisioterapia_mmg
        </a>
      </div>

      <div className="footer-copyright">
        <p>© 2026 María Montaño Fisioterapia. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;