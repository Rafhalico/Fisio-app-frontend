import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, Phone, Mail, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import Aviso from '../Aviso';
import { apiFetch, ERROR_CONEXION } from '../../api';
import { useDatos, fechaHora, citaCorta } from './useDatos';

const NOMBRE_ROL = { admin: 'Administrador', fisio: 'Fisio', paciente: 'Paciente' };
const ICONO_ROL = { admin: ShieldCheck, fisio: Stethoscope, paciente: UserRound };

// Lista de cuentas con buscador y filtros; al pulsar una se abre su ficha.
function UsuariosAdmin() {
  const [parametros, setParametros] = useSearchParams();
  const id = parametros.get('id');
  const [buscar, setBuscar] = useState('');
  const [buscando, setBuscando] = useState('');
  const rol = parametros.get('rol') || '';
  const estado = parametros.get('estado') || '';

  const cambiarFiltro = (clave, valor) => {
    const nuevos = new URLSearchParams(parametros);
    if (valor) nuevos.set(clave, valor); else nuevos.delete(clave);
    nuevos.delete('id');
    setParametros(nuevos);
  };
  const abrir = (idUsuario) => { const n = new URLSearchParams(parametros); n.set('id', idUsuario); setParametros(n); };
  const cerrar = () => { const n = new URLSearchParams(parametros); n.delete('id'); setParametros(n); };

  const consulta = new URLSearchParams({ buscar: buscando, rol, estado }).toString();
  const { datos, error, cargando, recargar } = useDatos(`/admin/usuarios?${consulta}`);

  if (id) return <FichaUsuario id={id} onVolver={() => { cerrar(); recargar(); }} />;

  return (
    <div>
      <form className="filtros-admin" role="search" onSubmit={(e) => { e.preventDefault(); setBuscando(buscar.trim()); }}>
        <div className="campo campo-buscar">
          <label htmlFor="buscar-usuario">Buscar</label>
          <div className="input-con-boton">
            <input id="buscar-usuario" type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)}
              placeholder="Nombre, usuario, correo o teléfono" />
            <button type="submit" className="input-boton" aria-label="Buscar"><Search size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="campo">
          <label htmlFor="filtro-rol">Tipo</label>
          <select id="filtro-rol" value={rol} onChange={(e) => cambiarFiltro('rol', e.target.value)}>
            <option value="">Todos</option>
            <option value="paciente">Pacientes</option>
            <option value="fisio">Fisios</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="campo">
          <label htmlFor="filtro-estado">Estado</label>
          <select id="filtro-estado" value={estado} onChange={(e) => cambiarFiltro('estado', e.target.value)}>
            <option value="">Todos</option>
            <option value="sinverificar">Sin verificar</option>
            <option value="bloqueados">Bloqueados</option>
          </select>
        </div>
      </form>

      <Aviso tipo="error">{error}</Aviso>
      {!datos ? (
        <p className="estado-vacio">Cargando…</p>
      ) : datos.length === 0 ? (
        <p className="estado-vacio">No hay ninguna cuenta con esos filtros.</p>
      ) : (
        <>
          <p className="texto-suave nota-pequena" aria-live="polite">{cargando ? 'Buscando…' : `${datos.length} ${datos.length === 1 ? 'cuenta' : 'cuentas'}`}</p>
          <ul className="lista-usuarios">
            {datos.map((u) => {
              const Icono = ICONO_ROL[u.rol];
              return (
                <li key={u.id}>
                  <button type="button" className="fila-usuario" onClick={() => abrir(u.id)}>
                    <span className={`avatar-rol rol-${u.rol}`} aria-hidden="true"><Icono size={18} /></span>
                    <span className="fila-usuario-datos">
                      <strong>{u.nombre} {u.apellidos}</strong>
                      <small>{u.nombreusuario} · {u.email}{u.telefono ? ` · ${u.telefono}` : ''}</small>
                    </span>
                    <span className="fila-usuario-etiquetas">
                      {u.rol !== 'paciente' && <span className={`etiqueta etiqueta-rol-${u.rol}`}>{NOMBRE_ROL[u.rol]}</span>}
                      {!u.verificado && <span className="etiqueta etiqueta-un-fisio">Sin verificar</span>}
                      {u.bloqueado && <span className="etiqueta etiqueta-cerrado">Bloqueada</span>}
                      {u.rol === 'paciente' && <span className="fila-usuario-citas">{u.proximas} próx. · {u.total} total</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// Ficha de una cuenta: datos, acciones y sus citas.
function FichaUsuario({ id, onVolver }) {
  const { datos, error, recargar } = useDatos(`/admin/usuarios/${id}`);
  const [aviso, setAviso] = useState(null);
  const [confirmando, setConfirmando] = useState(null); // acción pendiente de confirmar
  const [trabajando, setTrabajando] = useState(false);
  const [borrada, setBorrada] = useState(false);

  async function hacer(accion) {
    setTrabajando(true);
    setAviso(null);
    try {
      const opciones = accion === 'borrar' ? { method: 'DELETE' }
        : accion === 'restablecer' ? { method: 'POST' }
        : { method: 'PUT', body: JSON.stringify({ accion }) };
      const ruta = accion === 'restablecer' ? `/admin/usuarios/${id}/restablecer` : `/admin/usuarios/${id}`;
      const r = await apiFetch(ruta, opciones);
      const texto = await r.text();
      setAviso({ tipo: r.ok ? 'ok' : 'error', texto });
      if (r.ok && accion === 'borrar') setBorrada(true);
      else if (r.ok) recargar();
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    } finally {
      setTrabajando(false);
      setConfirmando(null);
    }
  }

  const volver = (
    <button type="button" className="btn-texto" onClick={onVolver}><ArrowLeft size={16} aria-hidden="true" /> Volver a la lista</button>
  );
  if (borrada) return <div className="ficha-usuario">{volver}<Aviso tipo="ok">{aviso?.texto}</Aviso></div>;
  if (error) return <div className="ficha-usuario">{volver}<Aviso tipo="error">{error}</Aviso></div>;
  if (!datos) return <p className="estado-vacio">Cargando…</p>;

  const { usuario: u, citas } = datos;
  const editable = u.rol !== 'admin';
  // Acciones con su texto de confirmación (las que cambian algo importante piden confirmar)
  const acciones = [
    u.rol === 'paciente' && { id: 'hacerFisio', texto: 'Hacer fisio', confirmar: `${u.nombre} pasará a ver la agenda de la clínica y saldrá en «Asignar a». ¿Seguro?` },
    u.rol === 'fisio' && { id: 'hacerPaciente', texto: 'Quitar de fisio', confirmar: `${u.nombre} dejará de ver la agenda y sus citas próximas quedarán sin asignar. ¿Seguro?` },
    !u.verificado && { id: 'verificar', texto: 'Verificar cuenta' },
    u.email && { id: 'restablecer', texto: 'Enviar enlace para cambiar la contraseña' },
    !u.bloqueado && { id: 'bloquear', texto: 'Bloquear', peligro: true, confirmar: `${u.nombre} no podrá entrar en la web hasta que la desbloquees. ¿Seguro?` },
    u.bloqueado && { id: 'desbloquear', texto: 'Desbloquear' },
    { id: 'borrar', texto: 'Borrar cuenta', peligro: true, confirmar: `Se borrarán los datos de ${u.nombre} y se cancelarán sus citas pendientes. No se puede deshacer. ¿Seguro?` },
  ].filter(Boolean);
  const pendiente = acciones.find((a) => a.id === confirmando);

  return (
    <div className="ficha-usuario">
      {volver}
      <div className="ficha-cabecera">
        <h3>{u.nombre} {u.apellidos}</h3>
        <span className={`etiqueta etiqueta-rol-${u.rol}`}>{NOMBRE_ROL[u.rol]}</span>
        {!u.verificado && <span className="etiqueta etiqueta-un-fisio">Sin verificar</span>}
        {u.bloqueado && <span className="etiqueta etiqueta-cerrado">Bloqueada</span>}
      </div>
      <dl className="lista-datos ficha-datos">
        <div><dt>Usuario</dt><dd>{u.nombreusuario}</dd></div>
        <div><dt>Correo</dt><dd>{u.email ? <a href={`mailto:${u.email}`}><Mail size={14} aria-hidden="true" /> {u.email}</a> : '—'}</dd></div>
        <div><dt>Teléfono</dt><dd>{u.telefono ? <a href={`tel:${u.telefono}`}><Phone size={14} aria-hidden="true" /> {u.telefono}</a> : '—'}</dd></div>
        <div><dt>Alta</dt><dd>{fechaHora(u.creadoen)}</dd></div>
      </dl>

      <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

      {editable ? (
        pendiente ? (
          <div className="confirmar-admin" role="alertdialog" aria-labelledby="texto-confirmar">
            <p id="texto-confirmar">{pendiente.confirmar}</p>
            <div className="nueva-cita-botones">
              <button type="button" className={pendiente.peligro ? 'btn btn-peligro' : 'btn btn-primario'} disabled={trabajando} onClick={() => hacer(pendiente.id)}>
                {trabajando ? 'Un momento…' : `Sí, ${pendiente.texto.toLowerCase()}`}
              </button>
              <button type="button" className="btn-texto" onClick={() => setConfirmando(null)}>No</button>
            </div>
          </div>
        ) : (
          <div className="acciones-admin">
            {acciones.map((a) => (
              <button key={a.id} type="button" disabled={trabajando}
                className={a.peligro ? 'btn btn-peligro-borde btn-pequeno' : 'btn btn-secundario btn-pequeno'}
                onClick={() => (a.confirmar ? setConfirmando(a.id) : hacer(a.id))}>
                {a.texto}
              </button>
            ))}
          </div>
        )
      ) : (
        <p className="texto-suave">La cuenta de administrador se cambia desde «Mi perfil».</p>
      )}

      <h4>Citas ({citas.length})</h4>
      {citas.length === 0 ? (
        <p className="texto-suave">No tiene citas.</p>
      ) : (
        <ul className="citas-ficha">
          {citas.map((c) => (
            <li key={c.id} className={c.estado === 'cancelada' ? 'cancelada' : ''}>
              <span className="citas-ficha-fecha">{citaCorta(c.datetime)}</span>
              <span>
                {c.laatiende ? <>Atiende a <strong>{c.nombrepaciente}</strong></> : (c.motivo || 'Sin motivo')}
                {!c.laatiende && c.nombrefisio && <small> · La atiende {c.nombrefisio}</small>}
                {c.estado === 'cancelada' && (
                  <small> · Cancelada por {c.canceladapor === 'fisio' ? 'la clínica' : 'el paciente'}{c.motivocancelacion ? `: ${c.motivocancelacion}` : ''}</small>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UsuariosAdmin;
