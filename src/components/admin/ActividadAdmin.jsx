import { useState } from 'react';
import { Search } from 'lucide-react';
import Aviso from '../Aviso';
import { useDatos, fechaHora } from './useDatos';

const TIPOS = {
  reserva: 'Reserva',
  cancelacion: 'Cancelación',
  asignacion: 'Asignación',
  cierre: 'Cierre de días',
  cuenta: 'Cuentas',
  admin: 'Administración',
  recordatorios: 'Recordatorios',
};
const QUIEN = { paciente: 'paciente', fisio: 'fisio', admin: 'administrador' };

// Registro de actividad: quién hizo qué y cuándo (se guarda un año).
function ActividadAdmin() {
  const [tipo, setTipo] = useState('');
  const [buscar, setBuscar] = useState('');
  const [buscando, setBuscando] = useState('');
  const { datos, error, cargando } = useDatos(`/admin/actividad?${new URLSearchParams({ tipo, buscar: buscando })}`);

  return (
    <div>
      <form className="filtros-admin" role="search" onSubmit={(e) => { e.preventDefault(); setBuscando(buscar.trim()); }}>
        <div className="campo">
          <label htmlFor="actividad-tipo">Tipo</label>
          <select id="actividad-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todo</option>
            {Object.entries(TIPOS).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
          </select>
        </div>
        <div className="campo campo-buscar">
          <label htmlFor="actividad-buscar">Buscar</label>
          <div className="input-con-boton">
            <input id="actividad-buscar" type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Nombre, fecha (2026-11-09)…" />
            <button type="submit" className="input-boton" aria-label="Buscar"><Search size={18} aria-hidden="true" /></button>
          </div>
        </div>
      </form>

      <Aviso tipo="error">{error}</Aviso>
      {!datos ? (
        <p className="estado-vacio">Cargando…</p>
      ) : datos.length === 0 ? (
        <p className="estado-vacio">{cargando ? 'Buscando…' : 'Todavía no hay actividad con esos filtros.'}</p>
      ) : (
        <>
          <p className="texto-suave nota-pequena">Últimos {datos.length} movimientos. Se guardan durante un año.</p>
          <ol className="lista-actividad">
            {datos.map((a) => (
              <li key={a.id}>
                <span className={`etiqueta etiqueta-tipo-${a.tipo}`}>{TIPOS[a.tipo] ?? a.tipo}</span>
                <span className="actividad-texto">
                  {a.detalle}
                  <small>
                    {fechaHora(a.fecha)} · {a.nombreusuario}{QUIEN[a.rol] ? ` (${QUIEN[a.rol]})` : ''}
                  </small>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

export default ActividadAdmin;
