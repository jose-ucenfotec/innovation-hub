import { Link } from 'react-router-dom';
import { BadgeTipo, BadgeEstado } from '../../components/ui/Badges.jsx';
import Chip from '../../components/ui/Chip.jsx';
import AccionesPropietario from './AccionesPropietario.jsx';
import { useSesion } from '../../context/SesionContext.jsx';

// Clases del Avance 1: el borde superior cambia de color según el tipo.
const CLASE_TIPO = { idea: 'idea', need: 'necesidad', challenge: 'reto' };

export default function TarjetaIniciativa({ ini, onCambio }) {
  const { usuario } = useSesion();
  const completa = ini.accessLevel === 'full';
  const esDueno = completa && usuario?.id === ini.owner.id;

  return (
    <article className={`card h-100 tarjeta-iniciativa tarjeta-iniciativa--${CLASE_TIPO[ini.type]}`}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h2 className="card-title mb-0">{ini.title}</h2>
          <BadgeTipo tipo={ini.type} />
        </div>
        <p className="card-text small text-body-secondary mt-2">{ini.summary}</p>
        <ul className="lista-chips mb-3">
          {ini.requiredSkills.slice(0, 3).map((s) => <li key={s.id}><Chip>{s.name}</Chip></li>)}
        </ul>
        <p className="small mb-2">
          <i className={`bi ${ini.category?.icon ?? 'bi-tag'}`} aria-hidden="true"></i> {ini.category?.name ?? 'Sin categoría'}
          {completa && <> · <i className="bi bi-person" aria-hidden="true"></i> {ini.owner.fullName}</>}
        </p>
        {completa ? (
          <p className="small mb-3 d-flex flex-wrap gap-2 align-items-center">
            <BadgeEstado estado={ini.status} />
            <span className="text-body-secondary">
              <i className="bi bi-person-plus" aria-hidden="true"></i> {ini.memberCount} {ini.memberCount === 1 ? 'integrante' : 'integrantes'} · {ini.availableSpots} {ini.availableSpots === 1 ? 'espacio' : 'espacios'}
            </span>
          </p>
        ) : (
          <p className="small mb-3"><Chip icono="bi-eye-slash" neutro>Contenido restringido</Chip></p>
        )}
        <div className="mt-auto d-flex flex-column gap-2">
          <Link className="btn btn-outline-primary btn-sm align-self-start" to={`/iniciativas/${ini.id}`}>
            Ver detalle <i className="bi bi-arrow-right" aria-hidden="true"></i>
          </Link>
          {esDueno && <AccionesPropietario ini={ini} variante="tarjeta" onCambio={onCambio} />}
        </div>
      </div>
    </article>
  );
}