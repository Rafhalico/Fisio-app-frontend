import Navbar from './Navbar';
import Footer from './Footer';
import { useTitulo } from '../hooks/useTitulo';

// Estructura común de todas las páginas: barra superior, contenido y pie.
// Antes cada página copiaba la navbar entera; ahora se escribe una vez.
function Pagina({ titulo, children }) {
  useTitulo(titulo);
  return (
    <>
      <a href="#contenido" className="saltar-contenido">Saltar al contenido</a>
      <Navbar />
      <main id="contenido">{children}</main>
      <Footer />
    </>
  );
}

// Cabecera de las páginas interiores (Reservar, Mis citas, Agenda...).
export function CabeceraPagina({ titulo, subtitulo }) {
  return (
    <section className="cabecera-pagina">
      <div className="contenedor">
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
    </section>
  );
}

export default Pagina;
