import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Link} from 'react-router-dom';
import Footer from '../components/Footer';

function Acceso() {
    const [nombreusuario, setNombreusuario] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();
    const [nombreReg, setNombreReg] = useState('');
    const [apellidosReg, setApellidosReg] = useState('');
    const [nombreusuarioReg, setNombreusuarioReg] = useState('');
    const [contraseñaReg, setContraseñaReg] = useState('');
    const [telefonoReg, setTelefonoReg] = useState('');
    const [emailReg, setEmailReg] = useState('');
    const [mensajeRegistro, setMensajeRegistro] = useState('');
    const [esperandoCodigo, setEsperandoCodigo] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [nombreusuarioRegistrado, setNombreusuarioRegistrado] = useState('');

async function handleLogin(){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({nombreusuario, contraseña})
    });
    if (!response.ok) {
        const errorTexto = await response.text();
        setMensaje(errorTexto);
        return;
    }
        const data = await response.json();
        localStorage.setItem('usuario', JSON.stringify(data));
        setMensaje('Inicio de sesión exitoso');
        
      
    if (data.rol === 'fisio') {
      navigate('/agenda');
    
    } else {
      navigate('/reservar');
    }

}

async function handleRegister(){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            nombre: nombreReg,
            apellidos: apellidosReg,
            nombreusuario: nombreusuarioReg,
            contraseña: contraseñaReg,
            telefono: telefonoReg,
            email: emailReg
        })
    });
        if (!response.ok) {
      const errorTexto = await response.text();
      setMensajeRegistro(errorTexto);
      return;
    }

    setNombreusuarioRegistrado(nombreusuarioReg);
    setEsperandoCodigo(true);
  }

  async function handleVerificar(){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/verificar`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        nombreusuario: nombreusuarioRegistrado,
        codigo: codigoIngresado
      })
    });
  if (!response.ok) {
    const errorTexto = await response.text();
    setMensajeRegistro(errorTexto);
  return;
}

    const data = await response.json();
    localStorage.setItem('usuario', JSON.stringify(data));
    navigate('/reservar');
  }

    return (
  <>
   <nav className="navbar">
  <div className="logo">
    <span className="logo-nombre">María Montaño</span>
    <span className="logo-sub">FISIOTERAPIA</span>
  </div>
  <div className="navbar-links">
  <Link to="/" className="btn-nav">Inicio</Link>
  <Link to="/mis-citas" className="btn-nav">Mis citas</Link>
  <Link to="/reservar" className="btn-nav">Reservar cita</Link>
</div>
</nav>

    <section className="acceso-hero">
      <div className="acceso-intro">
        <h1 className="acceso-titulo">Bienvenido de nuevo</h1>
        <p className="acceso-subtitulo">
          Accede a tu cuenta para gestionar tus citas y seguir cuidando de tu bienestar.
        </p>
      </div>

      <div className="acceso-tarjetas">
        {!esperandoCodigo &&
        <div className="tarjeta-acceso">
          <div className="tarjeta-icono">👤</div>
          <h2>Iniciar sesión</h2>
          <label>Nombre de usuario</label>
          <input
            placeholder="tu_usuario"
            value={nombreusuario}
            onChange={(e) => setNombreusuario(e.target.value)}
          />
          <label>Contraseña</label>
          <input
            placeholder="Contraseña"
            value={contraseña}
            type="password"
            onChange={(e) => setContraseña(e.target.value)}
          />
          <button className="btn-degradado" onClick={handleLogin}>Iniciar sesión</button>
          <p className="mensaje-feedback">{mensaje}</p>
        </div>
}

                <div className="tarjeta-acceso">
          <div className="tarjeta-icono">✚</div>
          {!esperandoCodigo ? (
            <>
              <h2>Crear cuenta</h2>
              <label>Nombre</label>
              <input
                placeholder="Tu nombre"
                value={nombreReg}
                onChange={(e) => setNombreReg(e.target.value)}
              />
              <label>Apellidos</label>
              <input
                placeholder="Tus apellidos"
                value={apellidosReg}
                onChange={(e) => setApellidosReg(e.target.value)}
              />
              <label>Nombre de usuario</label>
              <input
                placeholder="Elige un usuario"
                value={nombreusuarioReg}
                onChange={(e) => setNombreusuarioReg(e.target.value)}
              />
              <label>Contraseña</label>
              <input
                placeholder="Contraseña"
                value={contraseñaReg}
                type="password"
                onChange={(e) => setContraseñaReg(e.target.value)}
              />
              <label>Teléfono</label>
              <input
                placeholder="Tu teléfono"
                value={telefonoReg}
                onChange={(e) => setTelefonoReg(e.target.value)}
              />
              <label>Email</label>
              <input
                placeholder="tu@email.com"
                value={emailReg}
                onChange={(e) => setEmailReg(e.target.value)}
              />
              <button className="btn-degradado" onClick={handleRegister}>Crear cuenta</button>
            </>
          ) : (
            <>
              <h2>Verifica tu email</h2>
              <p>Te hemos enviado un código a tu correo. Introdúcelo aquí:</p>
              <input
                placeholder="Código de 6 dígitos"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
              />
              <button className="btn-degradado" onClick={handleVerificar}>Verificar</button>
            </>
          )}
          <p className="mensaje-feedback">{mensajeRegistro}</p>
        </div>
      </div>

      <div className="acceso-beneficios">
        <p className="beneficios-quote">"Tu bienestar es nuestra prioridad"</p>
        <div className="beneficio-item">
          <h3>Gestiona tus citas</h3>
          <p>Reserva, modifica o cancela tus citas fácilmente.</p>
        </div>
        <div className="beneficio-item">
          <h3>Cuidado continuo</h3>
          <p>Accede a tu historial de citas cuando quieras.</p>
        </div>
      </div>
    </section>
    <Footer />
  </>

    )    
}
export default Acceso