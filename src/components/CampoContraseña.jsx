import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Input de contraseña con botón para mostrarla u ocultarla.
// Evita errores al escribirla, sobre todo desde el móvil.
function CampoContraseña({ id, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-con-boton">
      <input id={id} type={visible ? 'text' : 'password'} {...props} />
      <button
        type="button"
        className="input-boton"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-controls={id}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default CampoContraseña;
