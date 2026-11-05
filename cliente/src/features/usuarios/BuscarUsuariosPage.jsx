import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar.jsx';
import Chip from '../../components/ui/Chip.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useValorDiferido } from '../../hooks/useValorDiferido.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { buscarUsuarios } from '../../api/usuarios.js';
import { listarCompetencias } from '../../api/catalogos.js';

export default function BuscarUsuariosPage() {
  useTituloPagina('Personas');
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [competencia, setCompetencia] = useState('');
  const [disponibles, setDisponibles] = useState(false);
  const [pagina, setPagina] = useState(1);
  const q = useValorDiferido(nombre);
  const career = useValorDiferido(carrera);

  const catalogo = useConsulta((signal) => listarCompetencias(signal), []);
  const { cargando, error, datos, recargar } = useConsulta(
    (signal) => buscarUsuarios({ q, career, skill: competencia, available: disponibles ? 'true' : '', page: pagina, size: 12 }, signal),
    [q, career, competencia, disponibles, pagina]
  );
  const conPagina1 = (fijar) => (valor) => { fijar(valor); setPagina(1); };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-1">Personas</h1>
      <p className="text-body-secondary mb-4">Encontrá con quién colaborar según su carrera, competencias y disponibilidad.</p>
      <form className="formulario-tarjeta row g-3 mb-4" role="search" aria-label="Buscar personas" onSubmit={(e) => e.preventDefault()}>
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="p-nombre">Nombre</label>
          <input id="p-nombre" type="search" className="form-control" value={nombre} onChange={(e) => conPagina1(setNombre)(e.target.value)} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label" htmlFor="p-carrera">Carrera o área</label>
          <input id="p-carrera" className="form-control" value={carrera} onChange={(e) => conPagina1(setCarrera)(e.target.value)} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label" htmlFor="p-competencia">Competencia</label>
          <select id="p-competencia" className="form-select" value={competencia} onChange={(e) => conPagina1(setCompetencia)(e.target.value)}>
            <option value="">Todas</option>
            {(catalogo.datos ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-2 d-flex align-items-end">
          <div className="form-check">
            <input id="p-disponibles" type="checkbox" className="form-check-input" checked={disponibles} onChange={(e) => conPagina1(setDisponibles)(e.target.checked)} />
            <label className="form-check-label" htmlFor="p-disponibles">Con disponibilidad</label>
          </div>
        </div>
      </form>

      {cargando && <EstadoCarga texto="Buscando personas…" />}
      {error && <EstadoError error={error} onReintentar={recargar} />}
      {datos && !cargando && datos.items.length === 0 && <EstadoVacio titulo="No encontramos personas con esos criterios" />}
      {datos && !cargando && datos.items.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {datos.items.map((p) => (
              <div className="col" key={p.id}>
                <article className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Avatar nombre={p.fullName} />
                      <div>
                        <h2 className="h6 mb-0"><Link to={`/usuarios/${p.id}`}>{p.fullName}</Link></h2>
                        <span className="small text-body-secondary">{p.career}</span>
                      </div>
                    </div>
                    <p className="small mb-2">
                      <i className="bi bi-clock" aria-hidden="true"></i> {p.availability.hoursPerWeek > 0 ? `${p.availability.hoursPerWeek} h/semana` : 'Sin disponibilidad'}
                    </p>
                    <ul className="lista-chips">{p.skills.slice(0, 3).map((s) => <li key={s.skillId}><Chip nivel={s.level}>{s.name}</Chip></li>)}</ul>
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