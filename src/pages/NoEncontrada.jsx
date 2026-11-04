import { Link } from 'react-router-dom';
import Pagina from '../components/Pagina';

function NoEncontrada() {
  return (
    <Pagina titulo="Página no encontrada">
      <section className="contenedor no-encontrada">
        <p className="no-encontrada-codigo" aria-hidden="true">404</p>
        <h1>Esta página no existe</h1>
        <p className="texto-suave">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
        <div className="botones-fila">
          <Link to="/" className="btn btn-primario">Ir al inicio</Link>
          <Link to="/reservar" className="btn btn-secundario">Reservar cita</Link>
        </div>
      </section>
    </Pagina>
  );
}

export default NoEncontrada;
