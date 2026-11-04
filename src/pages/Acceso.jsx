import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CalendarCheck, History, ShieldCheck } from 'lucide-react';
import Pagina from '../components/Pagina';
import Aviso from '../components/Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { guardarSesion, obtenerUsuario } from '../sesion';

const registroVacio = { nombre: '', apellidos: '', nombreusuario: '', email: '', telefono: '', contraseña: '' };

function Acceso() {
  const navigate = useNavigate();
  const [pestaña, setPestaña] = useState('login'); // 'login' | 'registro'
  const [login, setLogin] = useState({ nombreusuario: '', contraseña: '' });
  const [registro, setRegistro] = useState(registroVacio);
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [usuarioPendiente, setUsuarioPendiente] = useState('');
  const [aviso, setAviso] = useState(null); // { tipo, texto }
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  const usuario = obtenerUsuario();
  if (usuario) {
    return <Navigate to={usuario.rol === 'fisio' ? '/agenda' : '/reservar'} replace />;
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
    navigate(data.usuario.rol === 'fisio' ? '/agenda' : '/reservar');
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

  return (
    <Pagina titulo={pestaña === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}>
      <section className="acceso">
        <div className="contenedor acceso-interior">
          <div className="acceso-intro">
            <p className="eyebrow">Área de pacientes</p>
            <h1>Gestiona tus citas online</h1>
            <p className="acceso-subtitulo">
              Accede a tu cuenta para reservar, consultar o cancelar tus citas
              cuando te venga bien.
            </p>
            <ul className="acceso-beneficios">
              <li><CalendarCheck size={20} aria-hidden="true" /> Reserva en tiempo real, sin llamadas</li>
              <li><History size={20} aria-hidden="true" /> Consulta tu historial de citas</li>
              <li><ShieldCheck size={20} aria-hidden="true" /> Tus datos, protegidos</li>
            </ul>
          </div>

          <div className="tarjeta acceso-tarjeta">
            {esperandoCodigo ? (
              <form onSubmit={handleVerificar} className="formulario">
                <h2>Verifica tu email</h2>
                <p className="texto-suave">
                  Introduce el código de 6 cifras que te hemos enviado. Caduca en 15 minutos.
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
                  No me ha llegado, enviar otro código
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
                    Iniciar sesión
                  </button>
                  <button
                    type="button" role="tab" aria-selected={pestaña === 'registro'}
                    className={pestaña === 'registro' ? 'pestaña activa' : 'pestaña'}
                    onClick={() => cambiarPestaña('registro')}
                  >
                    Crear cuenta
                  </button>
                </div>

                <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

                {pestaña === 'login' ? (
                  <form onSubmit={handleLogin} className="formulario">
                    <div className="campo">
                      <label htmlFor="login-usuario">Nombre de usuario</label>
                      <input id="login-usuario" name="nombreusuario" value={login.nombreusuario}
                        onChange={campo(setLogin)} autoComplete="username" required />
                    </div>
                    <div className="campo">
                      <label htmlFor="login-contraseña">Contraseña</label>
                      <input id="login-contraseña" name="contraseña" type="password" value={login.contraseña}
                        onChange={campo(setLogin)} autoComplete="current-password" required />
                    </div>
                    <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
                      {enviando ? 'Entrando…' : 'Iniciar sesión'}
                    </button>
                    <p className="texto-suave centrado">
                      ¿Primera vez?{' '}
                      <button type="button" className="btn-texto" onClick={() => cambiarPestaña('registro')}>
                        Crea tu cuenta
                      </button>
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
                        <label htmlFor="reg-email">Email</label>
                        <input id="reg-email" name="email" type="email" value={registro.email}
                          onChange={campo(setRegistro)} autoComplete="email" required />
                      </div>
                      <div className="campo">
                        <label htmlFor="reg-telefono">Teléfono</label>
                        <input id="reg-telefono" name="telefono" type="tel" value={registro.telefono}
                          onChange={campo(setRegistro)} autoComplete="tel" required />
                      </div>
                    </div>
                    <div className="campo">
                      <label htmlFor="reg-usuario">Nombre de usuario</label>
                      <input id="reg-usuario" name="nombreusuario" value={registro.nombreusuario}
                        onChange={campo(setRegistro)} autoComplete="username" required />
                    </div>
                    <div className="campo">
                      <label htmlFor="reg-contraseña">Contraseña</label>
                      <input id="reg-contraseña" name="contraseña" type="password" value={registro.contraseña}
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
