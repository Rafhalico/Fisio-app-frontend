import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, History } from 'lucide-react';
import Pagina, { CabeceraPagina } from '../components/Pagina';
import ResumenAdmin from '../components/admin/ResumenAdmin';
import UsuariosAdmin from '../components/admin/UsuariosAdmin';
import CitasAdmin from '../components/admin/CitasAdmin';
import ActividadAdmin from '../components/admin/ActividadAdmin';

// Página de Administración (solo el administrador; el servidor lo comprueba en cada petición).
// La pestaña va en la dirección (?ver=usuarios) para que al recargar no se pierda.
const PESTAÑAS = [
  { id: 'resumen', texto: 'Resumen', icono: LayoutDashboard, Componente: ResumenAdmin },
  { id: 'usuarios', texto: 'Usuarios', icono: Users, Componente: UsuariosAdmin },
  { id: 'citas', texto: 'Citas', icono: CalendarDays, Componente: CitasAdmin },
  { id: 'actividad', texto: 'Actividad', icono: History, Componente: ActividadAdmin },
];

function Admin() {
  const [parametros, setParametros] = useSearchParams();
  const actual = PESTAÑAS.find((p) => p.id === parametros.get('ver')) ?? PESTAÑAS[0];
  const { Componente } = actual;

  return (
    <Pagina titulo="Administración" noIndexar>
      <CabeceraPagina titulo="Administración" subtitulo="Todo lo de la clínica en un sitio: cómo va la semana, cuentas, citas y quién ha hecho qué." />
      <section className="contenedor panel-flotante admin">
        <div className="tarjeta">
          <div className="pestañas pestañas-admin" role="tablist" aria-label="Secciones de administración">
            {PESTAÑAS.map(({ id, texto, icono: Icono }) => (
              <button key={id} type="button" role="tab" id={`pestaña-${id}`} aria-controls="panel-admin"
                aria-selected={actual.id === id} className={actual.id === id ? 'pestaña activa' : 'pestaña'}
                onClick={() => setParametros({ ver: id })}>
                <Icono size={16} aria-hidden="true" /> {texto}
              </button>
            ))}
          </div>
          <div id="panel-admin" role="tabpanel" aria-labelledby={`pestaña-${actual.id}`}>
            <Componente irA={(id, extra = {}) => setParametros({ ver: id, ...extra })} />
          </div>
        </div>
      </section>
    </Pagina>
  );
}

export default Admin;
