import { useSesion } from '../../context/SesionContext.jsx';
import EstadoCarga from '../ui/EstadoCarga.jsx';
import EstadoVacio from '../ui/EstadoVacio.jsx';

export default function RutaProtegida({ children }) {
  const { usuario, cargandoSesion } = useSesion();
  if (cargandoSesion) return <EstadoCarga texto="Verificando la sesión…" />;
  if (!usuario) {
    return (
      <div className="container py-5">
        <EstadoVacio titulo="Necesitás una sesión">
          Elegí un usuario en "Ver como", en la barra superior.
        </EstadoVacio>
      </div>
    );
  }
  return children;
}