import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeSolicitud } from '../../components/ui/Badges.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Chip from '../../components/ui/Chip.jsx';
import Modal from '../../components/ui/Modal.jsx';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useToast } from '../../context/ToastContext.jsx';
import { decidirSolicitud, listarSolicitudesRecibidas } from '../../api/solicitudes.js';
import { listarIniciativas } from '../../api/iniciativas.js';
import { listarCompetencias, listarRoles } from '../../api/catalogos.js';
import { ESTADOS_SOLICITUD, opciones } from '../../utils/etiquetas.js';
import { formatearFecha } from '../../utils/fechas.js';

const FILTROS_INICIALES = { initiativeId: '', status: 'pending', skill: '', role: '', from: '', to: '' };

export default function SolicitudesRecibidasPage() {
  useTituloPagina('Solicitudes recibidas');
  const mostrarToast = useToast();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [decision, setDecision] = useState(null); // { solicitud, tipo }
  const [comentario, setComentario] = useState('');
  const [procesando, setProcesando] = useState(false);

  const opcionesFiltro = useConsulta(
    (signal) => Promise.all([listarIniciativas({ owner: 'me', size: 50 }, signal), listarCompetencias(signal), listarRoles(signal)]),
    []
  );
  const { cargando, error, datos, recargar } = useConsulta(
    (signal) => listarSolicitudesRecibidas({ ...filtros, page: pagina, size: 10 }, signal),
    [JSON.stringify(filtros), pagina]
  );
  const [propias, competencias, roles] = opcionesFiltro.datos ?? [{ items: [] }, [], []];

  const cambiar = (campo) => (e) => { setFiltros((f) => ({ ...f, [campo]: e.target.value })); setPagina(1); };

  async function confirmarDecision() {
    setProcesando(true);
    try {
      await decidirSolicitud(decision.solicitud.id, decision.tipo, comentario.trim() || undefined);
      mostrarToast(decision.tipo === 'accepted'
        ? `${decision.solicitud.applicant.fullName} se incorporó al equipo.`
        : 'Solicitud rechazada.', decision.tipo === 'accepted' ? 'success' : 'secondary');
      recargar();
    } catch (e) {
      mostrarToast(e.message, 'danger');
    } finally {
      setDecision(null);
      setComentario('');
      setProcesando(false);
    }
  }

  const select = (id, etiqueta, valor, lista, todos = 'Todas') => (
    <div className="col-6 col-lg-2">
      <label className="form-label" htmlFor={id}>{etiqueta}</label>
      <select id={id} className="form-select" value={filtros[valor]} onChange={cambiar(valor)}>
        <option value="">{todos}</option>
        {lista.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <form className="formulario-tarjeta row g-2 mb-3" aria-label="Filtrar solicitudes recibidas" onSubmit={(e) => e.preventDefault()}>
        <div className="col-12 col-lg-4">
          <label className="form-label" htmlFor="r-iniciativa">Iniciativa</label>
          <select id="r-iniciativa" className="form-select" value={filtros.initiativeId} onChange={cambiar('initiativeId')}>
            <option value="">Todas mis iniciativas</option>
            {propias.items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
          </select>
        </div>
        {select('r-estado', 'Estado', 'status', opciones(ESTADOS_SOLICITUD), 'Todos')}
        {select('r-competencia', 'Competencia', 'skill', competencias.map((c) => ({ valor: c.id, texto: c.name })))}
        {select('r-rol', 'Rol', 'role', roles.map((r) => ({ valor: r.id, texto: r.name })), 'Todos')}
        <div className="col-6 col-lg-1">
          <label className="form-label" htmlFor="r-desde">Desde</label>
          <input id="r-desde" type="date" className="form-control" value={filtros.from} onChange={cambiar('from')} />
        </div>
        <div className="col-6 col-lg-1">
          <label className="form-label" htmlFor="r-hasta">Hasta</label>
          <input id="r-hasta" type="date" className="form-control" value={filtros.to} onChange={cambiar('to')} />
        </div>
      </form>

      {cargando && <EstadoCarga texto="Cargando solicitudes recibidas…" />}
      {error && <EstadoError error={error} onReintentar={recargar} />}
      {datos && !cargando && datos.items.length === 0 && <EstadoVacio titulo="No hay solicitudes con esos filtros" />}
      {datos && !cargando && datos.items.map((s) => (
        <article key={s.id} className="card mb-3">
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <Avatar nombre={s.applicant.fullName} />
                <div>
                  <Link className="fw-semibold" to={`/usuarios/${s.applicant.id}`}>{s.applicant.fullName}</Link>
                  <span className="d-block small text-body-secondary">{s.applicant.career} · para <Link to={`/iniciativas/${s.initiative.id}`}>{s.initiative.title}</Link></span>
                </div>
              </div>
              <BadgeSolicitud estado={s.status} />
            </div>
            <p className="mb-2">{s.message}</p>
            <p className="small text-body-secondary mb-2">
              Aporta <strong>{s.offeredSkill.name}</strong> como <strong>{s.role.name}</strong> · {s.availability} · {formatearFecha(s.createdAt)}
            </p>
            <ul className="lista-chips mb-3" aria-label="Competencias del solicitante">
              {s.applicant.skills.map((c) => <li key={c.skillId}><Chip nivel={c.level}>{c.name}</Chip></li>)}
            </ul>
            {s.status === 'pending' && (
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-success" onClick={() => setDecision({ solicitud: s, tipo: 'accepted' })}><i className="bi bi-check-lg" aria-hidden="true"></i> Aceptar</button>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setDecision({ solicitud: s, tipo: 'rejected' })}><i className="bi bi-x-lg" aria-hidden="true"></i> Rechazar</button>
              </div>
            )}
          </div>
        </article>
      ))}
      {datos && !cargando && <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={setPagina} />}

      <Modal
        abierto={!!decision} id="decision" onCerrar={() => !procesando && setDecision(null)}
        titulo={decision?.tipo === 'accepted' ? 'Aceptar solicitud' : 'Rechazar solicitud'}
        pie={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setDecision(null)} disabled={procesando}>Cancelar</button>
            <button type="button" className={`btn btn-${decision?.tipo === 'accepted' ? 'success' : 'danger'}`} onClick={confirmarDecision} disabled={procesando}>
              {decision?.tipo === 'accepted' ? 'Aceptar e incorporar' : 'Rechazar'}
            </button>
          </>
        }
      >
        <p>
          {decision?.tipo === 'accepted'
            ? <><strong>{decision?.solicitud.applicant.fullName}</strong> se incorporará automáticamente al equipo.</>
            : <>La solicitud de <strong>{decision?.solicitud.applicant.fullName}</strong> quedará rechazada.</>}
        </p>
        <CampoTexto id="comentario" etiqueta="Comentario (opcional)" multilinea max={300} valor={comentario} onChange={setComentario} className="mb-0" />
      </Modal>
    </>
  );
}