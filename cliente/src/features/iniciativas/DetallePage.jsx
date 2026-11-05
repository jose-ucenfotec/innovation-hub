import { Link, useNavigate, useParams } from 'react-router-dom';
import DetalleCompleto from './DetalleCompleto.jsx';
import DetalleRestringido from './DetalleRestringido.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { obtenerIniciativa } from '../../api/iniciativas.js';

export default function DetallePage() {
  const { id } = useParams(); // el detalle se genera a partir del parámetro de la ruta
  const navigate = useNavigate();
  const { cargando, error, datos: ini, recargar } = useConsulta((signal) => obtenerIniciativa(id, signal), [id]);
  useTituloPagina(ini?.title ?? 'Detalle de iniciativa');

  const volver = <Link className="btn btn-outline-primary" to="/iniciativas">Volver al catálogo</Link>;
  let contenido;
  if (cargando) contenido = <EstadoCarga texto="Cargando iniciativa…" />;
  else if (error?.status === 404) contenido = <EstadoVacio titulo="No encontramos esa iniciativa" accion={volver}>Puede haberse eliminado o no estar disponible para vos.</EstadoVacio>;
  else if (error?.status === 401) contenido = <EstadoVacio titulo="Iniciativa institucional" accion={<Link className="btn btn-primary" to="/login" state={{ desde: { pathname: `/iniciativas/${id}` } }}>Iniciar sesión</Link>}>Solo la pueden consultar usuarios con sesión iniciada.</EstadoVacio>;
  else if (error) contenido = <EstadoError error={error} onReintentar={recargar} />;
  else if (ini.accessLevel === 'summary') contenido = <DetalleRestringido ini={ini} />;
  else {
    contenido = (
      <DetalleCompleto
        ini={ini}
        onCambio={(resultado) => (resultado === 'eliminada' ? navigate('/iniciativas') : recargar())}
      />
    );
  }

  return (
    <div className="container py-4">
      <Link className="small text-body-secondary d-inline-block mb-2" to="/iniciativas">
        <i className="bi bi-arrow-left" aria-hidden="true"></i> Volver al catálogo
      </Link>
      {contenido}
    </div>
  );
}