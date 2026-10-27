import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import InicioPage from './features/inicio/InicioPage.jsx';
import NoEncontradoPage from './pages/NoEncontradoPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InicioPage />} />
        <Route path="*" element={<NoEncontradoPage />} />
      </Route>
    </Routes>
  );
}