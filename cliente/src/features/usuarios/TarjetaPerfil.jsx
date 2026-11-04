import Avatar from '../../components/ui/Avatar.jsx';
import Chip from '../../components/ui/Chip.jsx';
import { TIPOS_MIEMBRO } from '../../utils/etiquetas.js';

export default function TarjetaPerfil({ persona, propio = false, children }) {
  const disponible = persona.availability?.hoursPerWeek > 0;
  const tipo = TIPOS_MIEMBRO[persona.memberType];
  return (
    <div className="card">
      <div className="card-body">
        <div className="text-center">
          <Avatar nombre={persona.fullName} grande />
          <h2 className="h4 mt-3 mb-1">{persona.fullName}</h2>
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-2">
            {tipo && <Chip icono={tipo.icono}>{tipo.texto}</Chip>}
            <span className={`badge ${disponible ? 'text-bg-success' : 'text-bg-secondary'}`}>
              <i className={`bi ${disponible ? 'bi-check-circle-fill' : 'bi-pause-circle'}`} aria-hidden="true"></i> {disponible ? 'Disponible' : 'Sin disponibilidad'}
            </span>
          </div>
          <p className="small text-body-secondary mb-1"><i className="bi bi-book" aria-hidden="true"></i> {persona.career}</p>
          <p className="small text-body-secondary mb-1">
            <i className="bi bi-clock" aria-hidden="true"></i> {disponible ? `${persona.availability.hoursPerWeek} h/semana · ${persona.availability.detail}` : 'No disponible por ahora'}
          </p>
          {propio && <p className="small text-body-secondary mb-1"><i className="bi bi-envelope" aria-hidden="true"></i> {persona.email}</p>}
          {persona.portfolioUrl && (
            <p className="small mb-2">
              <a href={persona.portfolioUrl} target="_blank" rel="noopener noreferrer">
                <i className="bi bi-link-45deg" aria-hidden="true"></i> {persona.portfolioUrl.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
          <p className="small">{persona.bio || 'Sin descripción todavía.'}</p>
        </div>
        <h3 className="seccion-titulo mt-3">Competencias</h3>
        <ul className="lista-chips mb-3">
          {persona.skills.length
            ? persona.skills.map((s) => <li key={s.skillId}><Chip nivel={s.level}>{s.name}</Chip></li>)
            : <li className="small text-body-secondary">Sin competencias registradas.</li>}
        </ul>
        <h3 className="seccion-titulo">Intereses</h3>
        <ul className="lista-chips">
          {persona.interests.length
            ? persona.interests.map((i) => <li key={i}><Chip neutro>#{i}</Chip></li>)
            : <li className="small text-body-secondary">Sin intereses registrados.</li>}
        </ul>
        {children}
      </div>
    </div>
  );
}