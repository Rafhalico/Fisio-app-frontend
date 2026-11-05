import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import Aviso from '../Aviso';
import { useDatos, citaCorta, fechaHora } from './useDatos';
import { hoyTexto, sumarDias } from '../../utils/fechas';

const ORIGEN = { web: 'Web', manual: 'A mano', 'cuenta borrada': 'Cuenta borrada' };

// Todas las citas entre dos fechas, con filtros y descarga para Excel.
function CitasAdmin() {
  const [parametros, setParametros] = useSearchParams();
  const hoy = hoyTexto();
  const desde = parametros.get('desde') || hoy;
  const hasta = parametros.get('hasta') || sumarDias(hoy, 30);
  const estado = parametros.get('estado') || '';
  const origen = parametros.get('origen') || '';
  const sinAsignar = parametros.get('sinAsignar') || '';
  const [buscar, setBuscar] = useState(parametros.get('buscar') || '');

  const cambiar = (cambios) => {
    const n = new URLSearchParams(parametros);
    for (const [clave, valor] of Object.entries(cambios)) { if (valor) n.set(clave, valor); else n.delete(clave); }
    setParametros(n);
  };

  const consulta = new URLSearchParams({ desde, hasta, estado, origen, sinAsignar, buscar: parametros.get('buscar') || '' }).toString();
  const { datos, error, cargando } = useDatos(`/admin/citas?${consulta}`);
  const citas = datos?.citas ?? [];
  const activas = citas.filter((c) => c.estado !== 'cancelada').length;

  // CSV con ";" y BOM: así Excel en español lo abre bien, con tildes y columnas separadas.
  function descargar() {
    const columnas = ['Fecha', 'Hora', 'Paciente', 'Teléfono', 'Correo', 'Motivo', 'Estado', 'Atiende', 'Origen', 'Cancelada por', 'Motivo cancelación', 'Reservada el'];
    const celda = (v) => {
      const texto = String(v ?? '');
      return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
    };
    const filas = citas.map((c) => [
      c.datetime.slice(0, 10), c.datetime.slice(11), c.paciente, c.telefono, c.email, c.motivo,
      c.estado, c.fisio || (c.estado === 'cancelada' ? '' : 'Sin asignar'), ORIGEN[c.origen],
      c.canceladapor === 'fisio' ? 'Clínica' : c.canceladapor === 'paciente' ? 'Paciente' : '', c.motivocancelacion,
      c.creadaen ? fechaHora(c.creadaen) : ''
    ].map(celda).join(';'));
    const contenido = '﻿' + [columnas.join(';'), ...filas].join('\r\n');
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
    enlace.download = `citas_${desde}_a_${hasta}.csv`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  return (
    <div>
      <form className="filtros-admin" onSubmit={(e) => { e.preventDefault(); cambiar({ buscar: buscar.trim() }); }}>
        <div className="campo">
          <label htmlFor="citas-desde">Desde</label>
          <input id="citas-desde" type="date" value={desde} onChange={(e) => e.target.value && cambiar({ desde: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="citas-hasta">Hasta</label>
          <input id="citas-hasta" type="date" value={hasta} min={desde} onChange={(e) => e.target.value && cambiar({ hasta: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="citas-estado">Estado</label>
          <select id="citas-estado" value={estado} onChange={(e) => cambiar({ estado: e.target.value })}>
            <option value="">Todas</option>
            <option value="reservada">Reservadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        <div className="campo">
          <label htmlFor="citas-origen">Origen</label>
          <select id="citas-origen" value={origen} onChange={(e) => cambiar({ origen: e.target.value })}>
            <option value="">Todas</option>
            <option value="web">Desde la web</option>
            <option value="manual">Apuntadas a mano</option>
          </select>
        </div>
        <div className="campo campo-buscar">
          <label htmlFor="citas-buscar">Paciente o motivo</label>
          <div className="input-con-boton">
            <input id="citas-buscar" type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Ej: Ana, rodilla…" />
            <button type="submit" className="input-boton" aria-label="Buscar"><Search size={18} aria-hidden="true" /></button>
          </div>
        </div>
      </form>

      <div className="barra-resultados">
        <label className="casilla-simple">
          <input type="checkbox" checked={sinAsignar === '1'} onChange={(e) => cambiar({ sinAsignar: e.target.checked ? '1' : '' })} />
          Solo sin asignar
        </label>
        <span className="texto-suave" aria-live="polite">
          {cargando ? 'Buscando…' : `${citas.length} citas (${activas} activas)${citas.length >= 2000 ? ' · se muestran las 2000 primeras' : ''}`}
        </span>
        <button type="button" className="btn btn-secundario btn-pequeno" onClick={descargar} disabled={!citas.length}>
          <Download size={16} aria-hidden="true" /> Descargar para Excel
        </button>
      </div>

      <Aviso tipo="error">{error}</Aviso>
      {datos && citas.length === 0 && <p className="estado-vacio">No hay citas con esos filtros.</p>}
      {citas.length > 0 && (
        <div className="tabla-envoltorio" tabIndex={0} role="region" aria-label="Tabla de citas">
          <table className="tabla-admin">
            <thead>
              <tr><th scope="col">Cuándo</th><th scope="col">Paciente</th><th scope="col">Motivo</th><th scope="col">Atiende</th><th scope="col">Estado</th></tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id} className={c.estado === 'cancelada' ? 'cancelada' : ''}>
                  <td className="sin-salto" data-etiqueta="Cuándo">{citaCorta(c.datetime)}</td>
                  <td data-etiqueta="Paciente">
                    <strong>{c.paciente}</strong>
                    {c.origen !== 'web' && <span className="etiqueta etiqueta-manual">{ORIGEN[c.origen]}</span>}
                    {c.telefono && <small className="bloque"><a href={`tel:${c.telefono}`}>{c.telefono}</a></small>}
                  </td>
                  <td data-etiqueta="Motivo">{c.motivo || '—'}</td>
                  <td data-etiqueta="Atiende">{c.fisio || (c.estado === 'cancelada' ? '—' : <span className="texto-aviso">Sin asignar</span>)}</td>
                  <td data-etiqueta="Estado">
                    {c.estado === 'cancelada'
                      ? <span className="etiqueta etiqueta-cancelada" title={c.motivocancelacion || ''}>Cancelada ({c.canceladapor === 'fisio' ? 'clínica' : 'paciente'})</span>
                      : <span className="etiqueta etiqueta-realizada">{c.datetime < `${hoy} 00:00` ? 'Pasada' : 'Reservada'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CitasAdmin;
