import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeProyecto } from '../../components/ui/Badges.jsx';
import Chip from '../../components/ui/Chip.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { listarProyectos } from '../../api/proyectos.js';

export default function ProyectosPage() {
  useTituloPagina('Proyectos');
  const [pagina, setPagina] = useState(1);
  const { cargando, error, datos, recargar } = useConsulta((signal) => listarProyectos({ page: pagina, size: 9 }, signal), [pagina]);

  return (
    <div className="container py-4">
      <h1 className="h3 mb-1">Proyectos</h1>
      <p className="text-body-secondary mb-4">Iniciativas que ya formaron equipo y comenzaron su desarrollo.</p>
      {cargando && <EstadoCarga texto="Cargando proyectos…" />}
      {error && <EstadoError error={error} onReintentar={recargar} />}
      {datos && !cargando && datos.items.length === 0 && <EstadoVacio titulo="Todavía no hay proyectos visibles para vos" />}
      {datos && !cargando && datos.items.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {datos.items.map((p) => (
              <div className="col" key={p.id}>
                <article className="card h-100 tarjeta-iniciativa">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between gap-2">
                      <h2 className="card-title mb-0">{p.name}</h2>
                      <BadgeProyecto estado={p.status} />
                    </div>
                    <p className="small text-body-secondary mt-2">{p.objective}</p>
                    <ul className="lista-chips mb-3">{p.technologies.slice(0, 4).map((t) => <li key={t}><Chip neutro>{t}</Chip></li>)}</ul>
                    <p className="small mb-3">
                      <i className="bi bi-person" aria-hidden="true"></i> {p.owner.fullName} · <i className="bi bi-people" aria-hidden="true"></i> {p.memberCount} integrantes
                    </p>
                    <Link className="btn btn-outline-primary btn-sm mt-auto align-self-start" to={`/proyectos/${p.id}`}>Ver proyecto <i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
          <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={setPagina} />
        </>
      )}
    </div>
  );
}