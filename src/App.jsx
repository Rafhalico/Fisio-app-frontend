import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Inicio from './pages/Inicio';
import Acceso from './pages/Acceso';
import MisCitas from './pages/MisCitas';
import Reservar from './pages/Reservar';
import Agenda from './pages/Agenda';
import './App.css';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/acceso" element={<Acceso />} />
        <Route path="/reservar" element={<Reservar/>} />
        <Route path="/mis-citas" element={<MisCitas/>} />
        <Route path="/agenda" element={<Agenda/>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App