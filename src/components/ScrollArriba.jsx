import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al cambiar de página, vuelve arriba del todo
// (React Router mantiene el scroll de la página anterior si no se hace esto).
function ScrollArriba() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default ScrollArriba;
