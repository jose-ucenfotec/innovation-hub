import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import RutaProtegida from './components/layout/RutaProtegida.jsx';
import InicioPage from './features/inicio/InicioPage.jsx';
import CatalogoPage from './features/iniciativas/CatalogoPage.jsx';
import DetallePage from './features/iniciativas/DetallePage.jsx';
import FormularioIniciativaPage from './features/iniciativas/FormularioIniciativaPage.jsx';
import FormularioSolicitudPage from './features/solicitudes/FormularioSolicitudPage.jsx';
import SolicitudesLayout from './features/solicitudes/SolicitudesLayout.jsx';
import MisSolicitudesPage from './features/solicitudes/MisSolicitudesPage.jsx';
import SolicitudesRecibidasPage from './features/solicitudes/SolicitudesRecibidasPage.jsx';
import ConvertirProyectoPage from './features/proyectos/ConvertirProyectoPage.jsx';
import ProyectosPage from './features/proyectos/ProyectosPage.jsx';
import DetalleProyectoPage from './features/proyectos/DetalleProyectoPage.jsx';
import PerfilPage from './features/usuarios/PerfilPage.jsx';
import NoEncontradoPage from './pages/NoEncontradoPage.jsx';

const protegida = (elemento) => <RutaProtegida>{elemento}</RutaProtegida>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InicioPage />} />
        <Route path="iniciativas" element={<CatalogoPage />} />
        <Route path="iniciativas/nueva" element={protegida(<FormularioIniciativaPage />)} />
        <Route path="iniciativas/:id" element={<DetallePage />} />
        <Route path="iniciativas/:id/editar" element={protegida(<FormularioIniciativaPage />)} />
        <Route path="iniciativas/:id/solicitar" element={protegida(<FormularioSolicitudPage />)} />
        <Route path="iniciativas/:id/proyecto" element={protegida(<ConvertirProyectoPage />)} />
        <Route path="solicitudes" element={protegida(<SolicitudesLayout />)}>
          <Route index element={<MisSolicitudesPage />} />
          <Route path="recibidas" element={<SolicitudesRecibidasPage />} />
        </Route>
        <Route path="solicitudes/:solicitudId/editar" element={protegida(<FormularioSolicitudPage />)} />
        <Route path="proyectos" element={protegida(<ProyectosPage />)} />
        <Route path="proyectos/:id" element={protegida(<DetalleProyectoPage />)} />
        <Route path="perfil" element={protegida(<PerfilPage />)} />
        <Route path="usuarios/:id" element={protegida(<PerfilPage />)} />
        <Route path="*" element={<NoEncontradoPage />} />
      </Route>
    </Routes>
  );
}