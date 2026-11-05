import { useEffect, useState } from 'react';
import { EVENTO_SERVIDOR_LENTO } from '../api';

// Aviso flotante que sale solo cuando el servidor tarda en responder (porque estaba
// "dormido", ver api.js). Se quita solo en cuanto responde.
function AvisoServidor() {
  const [lento, setLento] = useState(false);

  useEffect(() => {
    const cambiar = (e) => setLento(e.detail);
    window.addEventListener(EVENTO_SERVIDOR_LENTO, cambiar);
    return () => window.removeEventListener(EVENTO_SERVIDOR_LENTO, cambiar);
  }, []);

  return (
    <div className={lento ? 'aviso-servidor visible' : 'aviso-servidor'} role="status" aria-live="polite">
      {lento && (
        <>
          <span className="girando" aria-hidden="true" />
          <span>
            <strong>Conectando con la clínica…</strong>
            <small>La primera vez puede tardar hasta un minuto. No cierres la página.</small>
          </span>
        </>
      )}
    </div>
  );
}

export default AvisoServidor;
