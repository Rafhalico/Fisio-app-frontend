import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, KeyRound, Trash2 } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import Aviso from '../components/Aviso';
import CampoContraseña from '../components/CampoContraseña';
import { apiFetch, ERROR_CONEXION } from '../api';
import { guardarSesion, cerrarSesion, obtenerUsuario } from '../sesion';

// Mi perfil: cambiar los datos de contacto, la contraseña y (solo pacientes) borrar la cuenta.
function Perfil() {
  const usuario = obtenerUsuario();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [emailOriginal, setEmailOriginal] = useState('');
  const [contraseñaEmail, setContraseñaEmail] = useState('');
  const [avisoDatos, setAvisoDatos] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [claves, setClaves] = useState({ actual: '', nueva: '', repetir: '' });
  const [avisoClave, setAvisoClave] = useState(null);
  const [cambiandoClave, setCambiandoClave] = useState(false);

  const [borrando, setBorrando] = useState(false);
  const [claveBorrar, setClaveBorrar] = useState('');
  const [avisoBorrar, setAvisoBorrar] = useState(null);
  const [enviandoBorrar, setEnviandoBorrar] = useState(false);

  useEffect(() => {
    apiFetch('/perfil')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setDatos(d); setEmailOriginal(d.email || ''); })
      .catch(() => setAvisoDatos({ tipo: 'error', texto: ERROR_CONEXION }));
  }, []);

  const cambiaEmail = datos && datos.email.trim().toLowerCase() !== emailOriginal.toLowerCase();
  const campo = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  async function guardarDatos(e) {
    e.preventDefault();
    setGuardando(true);
    setAvisoDatos(null);
    try {
      const r = await apiFetch('/perfil', {
        method: 'PUT',
        body: JSON.stringify({ ...datos, contraseña: cambiaEmail ? contraseñaEmail : undefined })
      });
      if (!r.ok) return setAvisoDatos({ tipo: 'error', texto: await r.text() });
      const respuesta = await r.json();
      guardarSesion(respuesta); // el nombre nuevo sale en "Hola, ..."
      setEmailOriginal(datos.email.trim().toLowerCase());
      setContraseñaEmail('');
      setAvisoDatos({ tipo: 'ok', texto: 'Datos guardados.' });
    } catch {
      setAvisoDatos({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarClave(e) {
    e.preventDefault();
    setAvisoClave(null);
    if (claves.nueva !== claves.repetir) {
      return setAvisoClave({ tipo: 'error', texto: 'Las dos contraseñas nuevas no coinciden.' });
    }
    setCambiandoClave(true);
    try {
      const r = await apiFetch('/perfil/contrasena', {
        method: 'PUT',
        body: JSON.stringify({ actual: claves.actual, nueva: claves.nueva })
      });
      if (!r.ok) return setAvisoClave({ tipo: 'error', texto: await r.text() });
      const respuesta = await r.json();
      guardarSesion(respuesta);
      setClaves({ actual: '', nueva: '', repetir: '' });
      setAvisoClave({ tipo: 'ok', texto: respuesta.mensaje });
    } catch {
      setAvisoClave({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setCambiandoClave(false);
    }
  }

  async function borrarCuenta(e) {
    e.preventDefault();
    setEnviandoBorrar(true);
    setAvisoBorrar(null);
    try {
      const r = await apiFetch('/perfil', { method: 'DELETE', body: JSON.stringify({ contraseña: claveBorrar }) });
      const texto = await r.text();
      if (!r.ok) return setAvisoBorrar({ tipo: 'error', texto });
      cerrarSesion();
      navigate('/', { replace: true, state: { aviso: texto } });
    } catch {
      setAvisoBorrar({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setEnviandoBorrar(false);
    }
  }

  return (
    <Pagina titulo="Mi perfil" noIndexar>
      <CabeceraPagina titulo="Mi perfil" subtitulo="Revisa tus datos de contacto o cambia tu contraseña." />

      <section className="contenedor panel-flotante perfil">
        <div className="tarjeta">
          <h2 className="tarjeta-titulo"><UserRound size={20} aria-hidden="true" /> Tus datos</h2>
          {!datos ? (
            <>
              <Aviso tipo={avisoDatos?.tipo}>{avisoDatos?.texto}</Aviso>
              {!avisoDatos && <p className="estado-vacio">Cargando…</p>}
            </>
          ) : (
            <form className="formulario" onSubmit={guardarDatos}>
              <p className="texto-suave">Tu nombre de usuario es <strong>{datos.nombreusuario}</strong>. También puedes entrar con tu correo.</p>
              <div className="campos-fila">
                <div className="campo">
                  <label htmlFor="perfil-nombre">Nombre</label>
                  <input id="perfil-nombre" name="nombre" value={datos.nombre} onChange={campo} maxLength={60} required autoComplete="given-name" />
                </div>
                <div className="campo">
                  <label htmlFor="perfil-apellidos">Apellidos</label>
                  <input id="perfil-apellidos" name="apellidos" value={datos.apellidos} onChange={campo} maxLength={100} required autoComplete="family-name" />
                </div>
              </div>
              <div className="campos-fila">
                <div className="campo">
                  <label htmlFor="perfil-telefono">Teléfono</label>
                  <input id="perfil-telefono" name="telefono" type="tel" inputMode="tel" value={datos.telefono || ''} onChange={campo} maxLength={20} required autoComplete="tel" />
                </div>
                <div className="campo">
                  <label htmlFor="perfil-email">Correo electrónico</label>
                  <input id="perfil-email" name="email" type="email" value={datos.email || ''} onChange={campo} maxLength={120} required autoComplete="email" />
                </div>
              </div>
              {cambiaEmail && (
                <div className="campo">
                  <label htmlFor="perfil-clave-email">Tu contraseña (para cambiar el correo)</label>
                  <CampoContraseña id="perfil-clave-email" value={contraseñaEmail} onChange={(e) => setContraseñaEmail(e.target.value)}
                    autoComplete="current-password" required aria-describedby="ayuda-clave-email" />
                  <small id="ayuda-clave-email">Al correo te llegan los recordatorios y el enlace para recuperar la cuenta.</small>
                </div>
              )}
              <Aviso tipo={avisoDatos?.tipo}>{avisoDatos?.texto}</Aviso>
              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </div>

        <div className="tarjeta">
          <h2 className="tarjeta-titulo"><KeyRound size={20} aria-hidden="true" /> Cambiar contraseña</h2>
          <form className="formulario" onSubmit={cambiarClave}>
            {/* Campo oculto con el usuario: ayuda al gestor de contraseñas del móvil a guardar la nueva */}
            <input type="text" name="username" autoComplete="username" value={datos?.nombreusuario || ''} readOnly hidden />
            <div className="campo">
              <label htmlFor="clave-actual">Contraseña actual</label>
              <CampoContraseña id="clave-actual" value={claves.actual} onChange={(e) => setClaves({ ...claves, actual: e.target.value })}
                autoComplete="current-password" required />
            </div>
            <div className="campos-fila">
              <div className="campo">
                <label htmlFor="clave-nueva">Contraseña nueva</label>
                <CampoContraseña id="clave-nueva" value={claves.nueva} onChange={(e) => setClaves({ ...claves, nueva: e.target.value })}
                  autoComplete="new-password" minLength={8} required aria-describedby="ayuda-clave-nueva" />
                <small id="ayuda-clave-nueva">Mínimo 8 caracteres.</small>
              </div>
              <div className="campo">
                <label htmlFor="clave-repetir">Repite la nueva</label>
                <CampoContraseña id="clave-repetir" value={claves.repetir} onChange={(e) => setClaves({ ...claves, repetir: e.target.value })}
                  autoComplete="new-password" minLength={8} required />
              </div>
            </div>
            <Aviso tipo={avisoClave?.tipo}>{avisoClave?.texto}</Aviso>
            <button type="submit" className="btn btn-secundario" disabled={cambiandoClave}>
              {cambiandoClave ? 'Cambiando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>

        {usuario?.rol === 'paciente' && (
          <div className="tarjeta zona-peligro">
            <h2 className="tarjeta-titulo"><Trash2 size={20} aria-hidden="true" /> Borrar mi cuenta</h2>
            {!borrando ? (
              <>
                <p className="texto-suave">Se cancelarán tus citas pendientes y se borrarán tus datos. No se puede deshacer.</p>
                <button type="button" className="btn btn-peligro-borde" onClick={() => setBorrando(true)}>Quiero borrar mi cuenta</button>
              </>
            ) : (
              <form className="formulario" onSubmit={borrarCuenta}>
                <p><strong>¿Seguro?</strong> Se cancelarán tus citas pendientes y no podrás recuperar la cuenta. Escribe tu contraseña para confirmarlo.</p>
                <div className="campo">
                  <label htmlFor="clave-borrar">Contraseña</label>
                  <CampoContraseña id="clave-borrar" value={claveBorrar} onChange={(e) => setClaveBorrar(e.target.value)}
                    autoComplete="current-password" required />
                </div>
                <Aviso tipo={avisoBorrar?.tipo}>{avisoBorrar?.texto}</Aviso>
                <div className="nueva-cita-botones">
                  <button type="submit" className="btn btn-peligro" disabled={enviandoBorrar || !claveBorrar}>
                    {enviandoBorrar ? 'Borrando…' : 'Sí, borrar mi cuenta'}
                  </button>
                  <button type="button" className="btn-texto" onClick={() => { setBorrando(false); setAvisoBorrar(null); }}>No, volver</button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
    </Pagina>
  );
}

export default Perfil;
