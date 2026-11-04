import { useEffect, useState } from 'react';
import { Phone, User } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import Calendario from '../components/Calendario';
import CitaCard from '../components/CitaCard';
import Aviso from '../components/Aviso';
import { apiFetch, ERROR_CONEXION } from '../api';
import { obtenerUsuario } from '../sesion';
import { hoyTexto, formatearDia, capitalizar } from '../utils/fechas';

function Agenda() {
  const usuario = obtenerUsuario();
  // Al entrar se muestra directamente el día de hoy.
  const [fecha, setFecha] = useState(hoyTexto());
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [recarga, setRecarga] = useState(0);

  function elegirFecha(nuevaFecha) {
    setFecha(nuevaFecha);
    setCargando(true);
    setAviso(null);
  }

  useEffect(() => {
    let activo = true;
    apiFetch(`/appointments?fecha=${fecha}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => { if (activo) setCitas(data); })
      .catch(() => { if (activo) setAviso({ tipo: 'error', texto: ERROR_CONEXION }); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [fecha, recarga]);

  // La fisio puede cancelar sin la restricción de 24 h (lo controla el backend).
  async function handleCancelar(idCita) {
    try {
      const response = await apiFetch(`/appointments/${idCita}`, { method: 'PUT' });
      setAviso({
        tipo: response.ok ? 'ok' : 'error',
        texto: response.ok ? 'Cita cancelada. Recuerda avisar al paciente.' : await response.text()
      });
      setRecarga((n) => n + 1);
    } catch {
      setAviso({ tipo: 'error', texto: ERROR_CONEXION });
    }
  }

  const numero = citas.length;

  return (
    <Pagina titulo="Mi agenda">
      <CabeceraPagina titulo="Mi agenda" subtitulo={`Hola, ${usuario.nombre}. Estas son las citas de tus pacientes.`} />

      <section className="contenedor panel-flotante">
        <div className="tarjeta panel-dos-columnas agenda">
          <div>
            <Calendario fechaSeleccionada={fecha} onSeleccionarFecha={elegirFecha} permitirPasado />
            <button type="button" className="btn-texto" onClick={() => elegirFecha(hoyTexto())}>
              Volver a hoy
            </button>
          </div>

          <div>
            <div className="agenda-cabecera">
              <h2>{capitalizar(formatearDia(fecha))}</h2>
              {!cargando && <span className="contador grande">{numero} {numero === 1 ? 'cita' : 'citas'}</span>}
            </div>
            <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>

            {cargando ? (
              <p className="estado-vacio">Cargando agenda…</p>
            ) : numero === 0 ? (
              <p className="estado-vacio">No hay citas este día.</p>
            ) : (
              <div className="lista-citas">
                {citas.map((cita) => (
                  <CitaCard
                    key={cita.id}
                    cita={cita}
                    onCancelar={handleCancelar}
                    vistaDia
                    titulo={<><User size={15} aria-hidden="true" /> {cita.nombre} {cita.apellidos}</>}
                    detalle={
                      <div className="cita-paciente">
                        <a href={`tel:${cita.telefono}`}><Phone size={14} aria-hidden="true" /> {cita.telefono}</a>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Pagina>
  );
}

export default Agenda;
