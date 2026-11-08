import { Link } from 'react-router-dom';
import { BadgeTipo, BadgeEstado, ChipVisibilidad } from '../../components/ui/Badges.jsx';
import Chip from '../../components/ui/Chip.jsx';
import ListaEquipo from '../equipo/ListaEquipo.jsx';
import AccionesPropietario from './AccionesPropietario.jsx';
import { useSesion } from '../../context/SesionContext.jsx';
import { formatearFecha } from '../../utils/fechas.js';

function AccionesVisitante({ ini, usuario }) {
  const esMiembro = ini.members.some((m) => m.userId === usuario?.id);
  if (esMiembro) return <p className="small text-success mb-0"><i className="bi bi-check-circle-fill" aria-hidden="true"></i> Formás parte del equipo.</p>;
  if (!['published', 'forming'].includes(ini.status)) return <p className="small text-body-secondary mb-0">Esta iniciativa ya no recibe solicitudes.</p>;
  if (!usuario) return <Link className="btn btn-outline-primary" to="/login" state={{ desde: { pathname: `/iniciativas/${ini.id}` } }}>Iniciá sesión para solicitar</Link>;
  return (
    <Link className="btn btn-primary" to={`/iniciativas/${ini.id}/solicitar`}>
      <i className="bi bi-send" aria-hidden="true"></i> Solicitar participación
    </Link>
  );
}

export default function DetalleCompleto({ ini, onCambio }) {
  const { usuario } = useSesion();
  const esDueno = usuario?.id === ini.owner.id;

  return (
    <article className="row g-4">
      <div className="col-lg-8">
        <h1 className="h2 mb-2">{ini.title}</h1>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <BadgeTipo tipo={ini.type} /> <BadgeEstado estado={ini.status} /> <ChipVisibilidad visibilidad={ini.visibility} />
        </div>
        <p className="small text-body-secondary d-flex flex-wrap gap-3 mb-3">
          <span><i className={`bi ${ini.category?.icon ?? 'bi-tag'}`} aria-hidden="true"></i> {ini.category?.name}</span>
          <span><i className="bi bi-person" aria-hidden="true"></i> <Link to={`/usuarios/${ini.owner.id}`}>{ini.owner.fullName}</Link></span>
          <span><i className="bi bi-calendar-event" aria-hidden="true"></i> Publicada {formatearFecha(ini.createdAt)}</span>
          <span><i className="bi bi-pencil" aria-hidden="true"></i> Editada {formatearFecha(ini.updatedAt)}</span>
        </p>
        {ini.projectId && (
          <div className="alert alert-info d-flex gap-2" role="status">
            <i className="bi bi-rocket-takeoff-fill" aria-hidden="true"></i>
            <div>Esta iniciativa ya es un proyecto. <Link to={`/proyectos/${ini.projectId}`}>Ver el proyecto</Link></div>
          </div>
        )}
        <p className="lead">{ini.summary}</p>
        <p>{ini.description}</p>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <div className="bloque-acento h-100">
              <h2 className="seccion-titulo">Problema identificado</h2>
              <p className="mb-0">{ini.problem}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bloque-acento bloque-acento--teal h-100">
              <h2 className="seccion-titulo">Beneficiarios</h2>
              <p className="mb-0">{ini.beneficiaries}</p>
            </div>
          </div>
        </div>
        <h2 className="seccion-titulo mt-4">Etiquetas</h2>
        <ul className="lista-chips">
          {ini.tags.length ? ini.tags.map((t) => <li key={t}><Chip neutro>#{t}</Chip></li>) : <li className="small text-body-secondary">Sin etiquetas</li>}
        </ul>
      </div>

      <aside className="col-lg-4">
        <div className="card tarjeta-lateral">
          <div className="card-body">
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="metrica">
                  <div className="seccion-titulo">Integrantes</div>
                  <div className="valor">{ini.memberCount} <small className="fs-6 fw-normal text-body-secondary">de {ini.estimatedMembers}</small></div>
                </div>
              </div>
              <div className="col-6">
                <div className="metrica metrica--acento">
                  <div className="seccion-titulo">Espacios</div>
                  <div className="valor">{ini.availableSpots} <small className="fs-6 fw-normal">libres</small></div>
                </div>
              </div>
            </div>
            <h2 className="seccion-titulo">Equipo</h2>
            <ListaEquipo ini={ini} puedeRetirar={esDueno && ini.status !== 'archived'} onCambio={onCambio} />
            <h2 className="seccion-titulo">Competencias requeridas</h2>
            <ul className="lista-chips mb-4">
              {ini.requiredSkills.map((s) => <li key={s.id}><Chip icono="bi-stars">{s.name}</Chip></li>)}
            </ul>
            {esDueno ? <AccionesPropietario ini={ini} variante="detalle" onCambio={onCambio} /> : <div className="d-grid"><AccionesVisitante ini={ini} usuario={usuario} /></div>}
          </div>
        </div>
      </aside>
    </article>
  );
}