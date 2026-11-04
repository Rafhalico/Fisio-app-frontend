import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Inicio from './pages/Inicio';
import Acceso from './pages/Acceso';
import MisCitas from './pages/MisCitas';
import Reservar from './pages/Reservar';
import Agenda from './pages/Agenda';
import NoEncontrada from './pages/NoEncontrada';
import Restablecer from './pages/Restablecer';
import RutaProtegida from './components/RutaProtegida';
import ScrollArriba from './components/ScrollArriba';
import './App.css';
function App() {
  return (
    <BrowserRouter>
      <ScrollArriba />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/acceso" element={<Acceso />} />
        <Route path="/restablecer" element={<Restablecer />} />
        <Route path="/reservar" element={<RutaProtegida rol="paciente"><Reservar/></RutaProtegida>} />
        <Route path="/mis-citas" element={<RutaProtegida rol="paciente"><MisCitas/></RutaProtegida>} />
        <Route path="/agenda" element={<RutaProtegida rol="fisio"><Agenda/></RutaProtegida>} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App
