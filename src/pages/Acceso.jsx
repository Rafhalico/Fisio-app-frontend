import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import Pagina from '../components/Pagina';
import Aviso from '../components/Aviso';
import CampoContraseña from '../components/CampoContraseña';
import EstadoClinica from '../components/EstadoClinica';
import { apiFetch, ERROR_CONEXION } from '../api';
import { guardarSesion, obtenerUsuario } from '../sesion';
import { CLINICA } from '../datos/clinica';

const registroVacio = { nombre: '', apellidos: '', nombreusuario: '', email: '', telefono: '', contraseña: '' };

function Acceso() {
  const navigate = useNavigate();
  const location = useLocation();
  // Página a la que quería ir antes de que le pidiéramos iniciar sesión (p. ej. /reservar?fecha=...)
  const desde = location.state?.desde;
  const veniaDeReservar = desde?.startsWith('/reservar');

  const [pestaña, setPestaña] = useState('login'); // 'login' | 'registro'
  const [login, setLogin] = useState({ nombreusuario: '', contraseña: '' });
  const [registro, setRegistro] = useState(registroVacio);
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [usuarioPendiente, setUsuarioPendiente] = useState('');
  const [aviso, setAviso] = useState(null); // { tipo, texto }
  const [enviando, setEnviando] = useState(false);

  // A dónde mandar a alguien con sesión: la fisio a su agenda; el paciente, a donde iba (o a reservar).
  const destino = (rol) => (rol === 'fisio' ? '/agenda' : desde && !desde.startsWith('/agenda') ? desde : '/reservar');

  // Si ya hay sesión, no tiene sentido mostrar el login.
  // (Este caso también se da justo después de entrar, así que debe ir al mismo destino.)
  const usuario = obtenerUsuario();
  if (usuario) {
    return <Navigate to={destino(usuario.rol)} replace />;
  }

  // Envuelve cada envío: pone el estado "enviando" y captura errores de conexión.
  async function enviar(accion) {
    setEnviando(true);
    setAviso(null);
    try {
      await accion();
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setEnviando(false);
    }
  }

  function entrar(data) {
    guardarSesion(data);
    navigate(destino(data.usuario.rol), { replace: true });
  }

  // "e.preventDefault()" evita que el formulario recargue la página al enviarse.
  const handleLogin = (e) => {
    e.preventDefault();
    enviar(async () => {
      const response = await apiFetch('/login', { method: 'POST', body: JSON.stringify(login) });
      if (!response.ok) return setAviso({ tipo: 'error', texto: await response.text() });
      entrar(await response.json());
    });
  };

  const handleRegistro = (e) => {
    e.preventDefault();
    enviar(async () => {
      const response = await apiFetch('/register', { method: 'POST', body: JSON.stringify(registro) });
      if (!response.ok) return setAviso({ tipo: 'error', texto: await response.text() });
      setUsuarioPendiente(registro.nombreusuario);
      setEsperandoCodigo(true);
      setAviso({ tipo: 'ok', texto: `Te hemos enviado un código a ${registro.email}.` });
    });
  };

  const handleVerificar = (e) => {
    e.preventDefault();
    enviar(async () => {
      const response = await apiFetch('/verificar', {
        method: 'POST',
        body: JSON.stringify({ nombreusuario: usuarioPendiente, codigo })
      });
      if (!response.ok) return setAviso({ tipo: 'error', texto: await response.text() });
      entrar(await response.json());
    });
  };

  const handleReenviar = () => enviar(async () => {
    const response = await apiFetch('/reenviar-codigo', {
      method: 'POST',
      body: JSON.stringify({ nombreusuario: usuarioPendiente })
    });
    setAviso({ tipo: response.ok ? 'info' : 'error', texto: await response.text() });
  });

  function cambiarPestaña(nueva) {
    setPestaña(nueva);
    setAviso(null);
  }

  // Actualiza un campo del objeto de estado a partir del "name" del input.
  const campo = (setter) => (e) => setter((previo) => ({ ...previo, [e.target.name]: e.target.value }));

  const titulo = esperandoCodigo ? 'Verifica tu email' : pestaña === 'login' ? 'Iniciar sesión' : 'Crear cuenta';

  return (
    <Pagina titulo={titulo}>
      <section className="acceso">
        <div className="contenedor acceso-interior">
          {/* Tres piezas del grid: en escritorio título y teléfono a la izquierda y formulario a la derecha;
              en móvil, título, formulario y teléfono, en ese orden. */}
          <div className="acceso-intro">
            <h1>Tu área de paciente</h1>
            <p className="acceso-subtitulo">
              {veniaDeReservar
                ? 'Para reservar la cita, entra con tu cuenta o créate una. Solo se hace una vez.'
                : 'Desde aquí reservas, consultas y cancelas tus citas cuando te venga bien.'}
            </p>
          </div>

          <div className="acceso-telefono">
            <p>¿Prefieres hacerlo por teléfono?</p>
            <a href={CLINICA.telefonoEnlace} className="acceso-numero">
              <Phone size={22} aria-hidden="true" /> {CLINICA.telefono}
            </a>
            <EstadoClinica />
          </div>

          <div className="acceso-tarjeta">
            {esperandoCodigo ? (
              <form onSubmit={handleVerificar} className="formulario">
                <h2>Revisa tu correo</h2>
                <p className="texto-suave">
                  Escribe el código de 6 cifras que te hemos enviado. Caduca en 15 minutos.
                  Si no lo ves, mira en la carpeta de spam.
                </p>
                <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>
                <div className="campo">
                  <label htmlFor="codigo">Código de verificación</label>
                  <input
                    id="codigo" className="input-codigo" value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric" autoComplete="one-time-code"
                    maxLength={6} pattern="\d{6}" required autoFocus
                    placeholder="000000"
                  />
                </div>
                <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
                  {enviando ? 'Comprobando…' : 'Verificar y entrar'}
                </button>
                <button type="button" className="btn-texto centrado" onClick={handleReenviar} disabled={enviando}>
                  Enviar otro código
                </button>
              </form>
            ) : (
              <>
                <div className="pestañas" role="tablist">
                  <button
                    type="button" role="tab" aria-selected={pestaña === 'login'}
                    className={pestaña === 'login' ? 'pestaña activa' : 'pestaña'}
                    onClick={() => cambiarPestaña('login')}
                  >
                    Ya tengo cuenta
                  </button>
                  <button
                    type="button" role="tab" aria-selected={pestaña === 'registro'}
                    className={pestaña === 'registro' ? 'pestaña activa' : 'pestaña'}
                    onClick={() => cambiarPestaña('registro')}
                  >
                    Soy nuevo
                  </button>
                </div>

                <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

                {pestaña === 'login' ? (
                  <form onSubmit={handleLogin} className="formulario">
                    <div className="campo">
                      <label htmlFor="login-usuario">Nombre de usuario</label>
                      <input id="login-usuario" name="nombreusuario" value={login.nombreusuario}
                        onChange={campo(setLogin)} autoComplete="username" autoCapitalize="none" required />
                    </div>
                    <div className="campo">
                      <label htmlFor="login-contraseña">Contraseña</label>
                      <CampoContraseña id="login-contraseña" name="contraseña" value={login.contraseña}
                        onChange={campo(setLogin)} autoComplete="current-password" required />
                    </div>
                    <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
                      {enviando ? 'Entrando…' : 'Iniciar sesión'}
                    </button>
                    <p className="texto-suave centrado">
                      ¿Has olvidado la contraseña? Llama a la clínica y te ayudamos a recuperarla.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegistro} className="formulario">
                    <div className="campos-fila">
                      <div className="campo">
                        <label htmlFor="reg-nombre">Nombre</label>
                        <input id="reg-nombre" name="nombre" value={registro.nombre}
                          onChange={campo(setRegistro)} autoComplete="given-name" required />
                      </div>
                      <div className="campo">
                        <label htmlFor="reg-apellidos">Apellidos</label>
                        <input id="reg-apellidos" name="apellidos" value={registro.apellidos}
                          onChange={campo(setRegistro)} autoComplete="family-name" required />
                      </div>
                    </div>
                    <div className="campos-fila">
                      <div className="campo">
                        <label htmlFor="reg-telefono">Teléfono</label>
                        <input id="reg-telefono" name="telefono" type="tel" value={registro.telefono}
                          onChange={campo(setRegistro)} autoComplete="tel" required />
                      </div>
                      <div className="campo">
                        <label htmlFor="reg-email">Email</label>
                        <input id="reg-email" name="email" type="email" value={registro.email}
                          onChange={campo(setRegistro)} autoComplete="email" required
                          aria-describedby="ayuda-email" />
                        <small id="ayuda-email">Te enviaremos un código para confirmarlo.</small>
                      </div>
                    </div>
                    <div className="campo">
                      <label htmlFor="reg-usuario">Nombre de usuario</label>
                      <input id="reg-usuario" name="nombreusuario" value={registro.nombreusuario}
                        onChange={campo(setRegistro)} autoComplete="username" autoCapitalize="none" required
                        aria-describedby="ayuda-usuario" />
                      <small id="ayuda-usuario">Lo usarás para entrar. Por ejemplo: ana.garcia</small>
                    </div>
                    <div className="campo">
                      <label htmlFor="reg-contraseña">Contraseña</label>
                      <CampoContraseña id="reg-contraseña" name="contraseña" value={registro.contraseña}
                        onChange={campo(setRegistro)} autoComplete="new-password" minLength={8} required
                        aria-describedby="ayuda-contraseña" />
                      <small id="ayuda-contraseña">Mínimo 8 caracteres.</small>
                    </div>
                    <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
                      {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </Pagina>
  );
}

export default Acceso;
