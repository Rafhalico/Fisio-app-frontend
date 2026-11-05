import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect } from 'react';
import { useTitulo } from '../hooks/useTitulo';

// Estructura común de todas las páginas: barra superior, contenido y pie.
// Antes cada página copiaba la navbar entera; ahora se escribe una vez.
// noIndexar: pide a Google que no guarde esta página (páginas privadas o de error).
function Pagina({ titulo, children, noIndexar = false }) {
  useTitulo(titulo);
  useEffect(() => {
    if (!noIndexar) return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [noIndexar]);
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
