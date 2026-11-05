import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../../context/SesionContext.jsx';
import EstadoCarga from '../ui/EstadoCarga.jsx';

// Este componente solo evita mostrar pantallas que de todos modos responderían 401.
export default function RutaProtegida({ children }) {
  const { usuario, cargandoSesion } = useSesion();
  const location = useLocation();
  if (cargandoSesion) return <EstadoCarga texto="Verificando la sesión…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location }} />;
  return children;
}