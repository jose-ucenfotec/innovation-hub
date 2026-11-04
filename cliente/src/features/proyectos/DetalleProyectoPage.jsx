import { Link, useParams } from 'react-router-dom';
import { BadgeProyecto } from '../../components/ui/Badges.jsx';
import Chip from '../../components/ui/Chip.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import RepositorioGithub from './RepositorioGithub.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { obtenerProyecto } from '../../api/proyectos.js';
import { formatearFecha } from '../../utils/fechas.js';

export default function DetalleProyectoPage() {
  const { id } = useParams();
  const { cargando, error, datos: p, recargar } = useConsulta((signal) => obtenerProyecto(id, signal), [id]);
  useTituloPagina(p?.name ?? 'Proyecto');

  if (cargando) return <div className="container py-4"><EstadoCarga texto="Cargando proyecto…" /></div>;
  if (error?.status === 404) return <div className="container py-4"><EstadoVacio titulo="No encontramos ese proyecto" accion={<Link className="btn btn-outline-primary" to="/proyectos">Ver proyectos</Link>} /></div>;
  if (error) return <div className="container py-4"><EstadoError error={error} onReintentar={recargar} /></div>;

  return (
    <div className="container py-4">
      <Link className="small text-body-secondary d-inline-block mb-2" to="/proyectos"><i className="bi bi-arrow-left" aria-hidden="true"></i> Volver a proyectos</Link>
      <article className="row g-4">
        <div className="col-lg-7">
          <h1 className="h2 mb-2">{p.name}</h1>
          <div className="d-flex flex-wrap gap-2 mb-3"><BadgeProyecto estado={p.status} /></div>
          <p className="small text-body-secondary">
            Iniciativa de origen: <Link to={`/iniciativas/${p.initiative.id}`}>{p.initiative.title}</Link> ·
            Inicio {formatearFecha(p.startDate)} · Fin estimado {p.estimatedEndDate ? formatearFecha(p.estimatedEndDate) : 'sin definir'}
          </p>
          <h2 className="seccion-titulo mt-3">Objetivo</h2>
          <p>{p.objective}</p>
          <h2 className="seccion-titulo">Descripción</h2>
          <p>{p.description}</p>
          <h2 className="seccion-titulo">Tecnologías</h2>
          <ul className="lista-chips mb-4">{p.technologies.length ? p.technologies.map((t) => <li key={t}><Chip neutro>{t}</Chip></li>) : <li className="small text-body-secondary">Sin definir</li>}</ul>
          {p.repositoryUrl ? <RepositorioGithub url={p.repositoryUrl} /> : <p className="small text-body-secondary">Sin repositorio asociado.</p>}
        </div>
        <aside className="col-lg-5">
          <div className="card tarjeta-lateral"><div className="card-body">
            <h2 className="seccion-titulo">Equipo</h2>
            <ul className="list-unstyled mb-0">
              <li className="d-flex align-items-center gap-2 mb-2"><Avatar nombre={p.owner.fullName} /> {p.owner.fullName} <span className="small text-body-secondary">· propietario</span></li>
              {p.members.map((m) => (
                <li key={m.userId} className="d-flex align-items-center gap-2 mb-2">
                  <Avatar nombre={m.fullName} />
                  <span>{m.fullName}<span className="d-block small text-body-secondary">{m.role.name}</span></span>
                </li>
              ))}
            </ul>
          </div></div>
        </aside>
      </article>
    </div>
  );
}