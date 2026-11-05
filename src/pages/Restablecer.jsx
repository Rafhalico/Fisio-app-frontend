import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import Pagina from '../components/Pagina';
import Aviso from '../components/Aviso';
import CampoContraseña from '../components/CampoContraseña';
import { apiFetch, ERROR_CONEXION } from '../api';
import { guardarSesion } from '../sesion';

// Página a la que lleva el enlace del correo de "he olvidado mi contraseña":
// /restablecer?token=...  Aquí se elige la contraseña nueva y se entra directamente.
function Restablecer() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [contraseña, setContraseña] = useState('');
  const [repetida, setRepetida] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [usuario, setUsuario] = useState(null); // tras cambiarla con éxito

  async function handleSubmit(e) {
    e.preventDefault();
    if (contraseña !== repetida) {
      setAviso({ tipo: 'error', texto: 'Las dos contraseñas no coinciden.' });
      return;
    }
    setEnviando(true);
    setAviso(null);
    try {
      const response = await apiFetch('/restablecer', {
        method: 'POST',
        body: JSON.stringify({ token, contraseña })
      });
      if (!response.ok) {
        setAviso({ tipo: 'error', texto: await response.text() });
        return;
      }
      const data = await response.json();
      guardarSesion(data);
      setUsuario(data.usuario);
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setEnviando(false);
    }
  }

  const destino = usuario?.rol === 'fisio' ? '/agenda' : '/reservar';

  return (
    <Pagina titulo="Nueva contraseña" noIndexar>
      <section className="acceso">
        <div className="contenedor restablecer">
          <div className="acceso-tarjeta">
            {usuario ? (
              <div className="formulario centrado-bloque">
                <span className="icono-circulo grande"><KeyRound size={30} aria-hidden="true" /></span>
                <h1>¡Contraseña cambiada!</h1>
                <p className="texto-suave">Hola, {usuario.nombre}. Ya has entrado en tu cuenta con la contraseña nueva.</p>
                <button type="button" className="btn btn-primario btn-bloque" onClick={() => navigate(destino)}>
                  {usuario.rol === 'fisio' ? 'Ir a mi agenda' : 'Reservar una cita'}
                </button>
              </div>
            ) : !token ? (
              <div className="formulario">
                <h1>Enlace no válido</h1>
                <p className="texto-suave">
                  Para cambiar la contraseña, abre el enlace que te enviamos por correo.
                  Si no lo tienes o ha caducado, pide uno nuevo.
                </p>
                <Link to="/acceso" className="btn btn-primario btn-bloque">Ir a la pantalla de acceso</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="formulario">
                <h1>Elige una contraseña nueva</h1>
                <p className="texto-suave">Tiene que tener al menos 8 caracteres.</p>
                <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>
                <div className="campo">
                  <label htmlFor="nueva-contraseña">Contraseña nueva</label>
                  <CampoContraseña id="nueva-contraseña" value={contraseña} onChange={(e) => setContraseña(e.target.value)}
                    autoComplete="new-password" minLength={8} required autoFocus />
                </div>
                <div className="campo">
                  <label htmlFor="repetir-contraseña">Repite la contraseña</label>
                  <CampoContraseña id="repetir-contraseña" value={repetida} onChange={(e) => setRepetida(e.target.value)}
                    autoComplete="new-password" minLength={8} required />
                </div>
                <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
                  {enviando ? 'Guardando…' : 'Guardar y entrar'}
                </button>
                {aviso?.tipo === 'error' && /caducado|no es válido/.test(aviso.texto) && (
                  <Link to="/acceso" className="btn-texto centrado">Pedir un enlace nuevo</Link>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </Pagina>
  );
}

export default Restablecer;
