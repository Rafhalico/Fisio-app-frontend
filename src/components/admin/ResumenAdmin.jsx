import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import Aviso from '../Aviso';
import { useDatos } from './useDatos';
import { aDate } from '../../utils/fechas';

// Resumen: cómo va la semana, pacientes, cancelaciones del mes y correos de hoy.
function ResumenAdmin({ irA }) {
  const { datos, error, cargando, recargar } = useDatos('/admin/resumen');

  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!datos) return <p className="estado-vacio">Cargando…</p>;

  const { semana, pacientes, citasMes, correos, fisios } = datos;
  const maxHuecos = Math.max(1, ...semana.map((d) => d.huecos));
  const porcentajeCorreos = Math.min(100, Math.round((correos.enviados / correos.limite) * 100));

  return (
    <div className="resumen-admin">
      <div className="resumen-cabecera">
        <p className="texto-suave">Datos de ahora mismo. Se actualizan al entrar.</p>
        <button type="button" className="btn-texto" onClick={recargar} disabled={cargando}>
          <RefreshCw size={15} aria-hidden="true" /> {cargando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      <div className="cifras">
        <div className="cifra">
          <span className="cifra-numero">{datos.citasHoy}</span>
          <span className="cifra-texto">citas hoy</span>
        </div>
        <div className="cifra">
          <span className="cifra-numero">{datos.ocupacion}%</span>
          <span className="cifra-texto">ocupación próximos 7 días</span>
        </div>
        <button type="button" className={datos.sinAsignar ? 'cifra cifra-aviso' : 'cifra'} onClick={() => irA('citas', { sinAsignar: '1' })}>
          <span className="cifra-numero">{datos.sinAsignar}</span>
          <span className="cifra-texto">citas sin asignar</span>
        </button>
        <button type="button" className="cifra" onClick={() => irA('usuarios')}>
          <span className="cifra-numero">{pacientes.total}</span>
          <span className="cifra-texto">pacientes ({pacientes.nuevos} nuevos este mes)</span>
        </button>
      </div>

      <div className="resumen-columnas">
        <section aria-labelledby="titulo-semana">
          <h3 id="titulo-semana">Próximos 7 días</h3>
          <ul className="barras-semana">
            {semana.map((d) => {
              const fecha = aDate(d.dia).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }).replace('.', '');
              return (
                <li key={d.dia} className={d.abierto ? '' : 'cerrado'}>
                  <span className="barra-dia">{fecha}</span>
                  {d.abierto && d.huecos > 0 ? (
                    <>
                      <span className="barra" aria-hidden="true">
                        <span className="barra-total" style={{ width: `${(d.huecos / maxHuecos) * 100}%` }}>
                          <span className="barra-llena" style={{ width: `${(d.citas / d.huecos) * 100}%` }} />
                        </span>
                      </span>
                      <span className="barra-dato">{d.citas}/{d.huecos}</span>
                    </>
                  ) : (
                    <span className="barra-dato barra-cerrado">{d.abierto ? 'Cerrado (cierre)' : 'Cerrado'}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="texto-suave nota-pequena">Citas / huecos de cada día.</p>
        </section>

        <section aria-labelledby="titulo-mes">
          <h3 id="titulo-mes">Este mes</h3>
          <dl className="lista-datos">
            <div><dt>Citas</dt><dd>{citasMes.activas}</dd></div>
            <div><dt>Apuntadas a mano</dt><dd>{citasMes.manuales}</dd></div>
            <div><dt>Canceladas por el paciente</dt><dd>{citasMes.canceladaspaciente}</dd></div>
            <div><dt>Canceladas por la clínica</dt><dd>{citasMes.canceladasclinica}</dd></div>
          </dl>

          <h3>Fisios (próximos 7 días)</h3>
          {fisios.length === 0 ? (
            <p className="texto-suave">Aún no hay ninguna cuenta de fisio. Hazla desde <button type="button" className="btn-texto" onClick={() => irA('usuarios')}>Usuarios</button>.</p>
          ) : (
            <dl className="lista-datos">
              {fisios.map((f) => <div key={f.id}><dt>{f.nombre}</dt><dd>{f.citassemana} {f.citassemana === 1 ? 'cita asignada' : 'citas asignadas'}</dd></div>)}
            </dl>
          )}
        </section>

        <section aria-labelledby="titulo-cuentas">
          <h3 id="titulo-cuentas">Cuentas</h3>
          <dl className="lista-datos">
            <div>
              <dt>Sin verificar</dt>
              <dd>{pacientes.sinverificar ? <button type="button" className="btn-texto" onClick={() => irA('usuarios', { estado: 'sinverificar' })}>Ver {pacientes.sinverificar}</button> : 0}</dd>
            </div>
            <div>
              <dt>Bloqueadas</dt>
              <dd>{pacientes.bloqueados ? <button type="button" className="btn-texto" onClick={() => irA('usuarios', { estado: 'bloqueados' })}>Ver {pacientes.bloqueados}</button> : 0}</dd>
            </div>
          </dl>

          <h3>Correos de hoy</h3>
          <div className="medidor" role="meter" aria-valuemin={0} aria-valuemax={correos.limite} aria-valuenow={correos.enviados}
            aria-label={`Correos enviados hoy: ${correos.enviados} de ${correos.limite}`}>
            <span className={porcentajeCorreos >= 80 ? 'medidor-lleno alto' : 'medidor-lleno'} style={{ width: `${porcentajeCorreos}%` }} />
          </div>
          <p className="texto-suave nota-pequena">
            {correos.enviados} de {correos.limite} (límite diario gratuito de Resend)
            {correos.fallidos > 0 && <> · <strong>{correos.fallidos} fallidos</strong></>}
          </p>
          <p className="nota-pequena"><Link to="/agenda">Ir a la agenda →</Link></p>
        </section>
      </div>
    </div>
  );
}

export default ResumenAdmin;
