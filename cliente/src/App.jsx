import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import InicioPage from './features/inicio/InicioPage.jsx';
import NoEncontradoPage from './pages/NoEncontradoPage.jsx';
import CatalogoPage from './features/iniciativas/CatalogoPage.jsx';
import DetallePage from './features/iniciativas/DetallePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InicioPage />} />
        <Route path="iniciativas" element={<CatalogoPage />} />
        <Route path="iniciativas/:id" element={<DetallePage />} />
        <Route path="*" element={<NoEncontradoPage />} />
      </Route>
    </Routes>
  );
}