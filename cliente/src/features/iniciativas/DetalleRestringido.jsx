import { Link } from 'react-router-dom';
import { BadgeTipo, ChipVisibilidad } from '../../components/ui/Badges.jsx';
import Chip from '../../components/ui/Chip.jsx';
import { useSesion } from '../../context/SesionContext.jsx';

export default function DetalleRestringido({ ini }) {
  const { usuario } = useSesion();
  return (
    <article className="row justify-content-center">
      <div className="col-lg-8">
        <h1 className="h2 mb-2">{ini.title}</h1>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <BadgeTipo tipo={ini.type} />
          <ChipVisibilidad visibilidad={ini.visibility} />
        </div>
        <div className="alert alert-warning d-flex gap-2" role="status">
          <i className="bi bi-info-circle-fill" aria-hidden="true"></i>
          <div>
            <strong>Contenido completo no disponible.</strong> Esta iniciativa es restringida: solo se muestra su resumen.
            La información completa es visible para el propietario y los miembros aceptados del equipo.
          </div>
        </div>
        <p className="lead">{ini.summary}</p>
        <h2 className="seccion-titulo mt-4">Categoría</h2>
        <p><i className={`bi ${ini.category?.icon ?? 'bi-tag'}`} aria-hidden="true"></i> {ini.category?.name ?? 'Sin categoría'}</p>
        <h2 className="seccion-titulo">Competencias requeridas</h2>
        <ul className="lista-chips mb-4">
          {ini.requiredSkills.map((s) => <li key={s.id}><Chip icono="bi-stars">{s.name}</Chip></li>)}
        </ul>
        {usuario && (
          <Link className="btn btn-primary" to={`/iniciativas/${ini.id}/solicitar`}>
            <i className="bi bi-send" aria-hidden="true"></i> Solicitar participación
          </Link>
        )}
        {!usuario && <Link className="btn btn-outline-primary" to="/login" state={{ desde: { pathname: `/iniciativas/${ini.id}` } }}>Iniciá sesión para solicitar participación</Link>}
      </div>
    </article>
  );
}