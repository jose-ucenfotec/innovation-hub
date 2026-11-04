import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeSolicitud } from '../../components/ui/Badges.jsx';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useToast } from '../../context/ToastContext.jsx';
import { cancelarSolicitud, listarMisSolicitudes } from '../../api/solicitudes.js';
import { ESTADOS_SOLICITUD, opciones } from '../../utils/etiquetas.js';
import { formatearFecha } from '../../utils/fechas.js';

export default function MisSolicitudesPage() {
  useTituloPagina('Mis solicitudes');
  const mostrarToast = useToast();
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porCancelar, setPorCancelar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const { cargando, error, datos, recargar } = useConsulta(
    (signal) => listarMisSolicitudes({ status: estado, page: pagina, size: 10 }, signal),
    [estado, pagina]
  );

  async function confirmarCancelacion() {
    setProcesando(true);
    try {
      await cancelarSolicitud(porCancelar.id);
      mostrarToast('Solicitud cancelada.', 'secondary');
      recargar();
    } catch (e) {
      mostrarToast(e.message, 'danger');
    } finally {
      setPorCancelar(null);
      setProcesando(false);
    }
  }

  return (
    <>
      <div className="row g-2 mb-3">
        <div className="col-sm-6 col-lg-3">
          <label className="form-label" htmlFor="f-estado">Estado</label>
          <select id="f-estado" className="form-select" value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1); }}>
            <option value="">Todos</option>
            {opciones(ESTADOS_SOLICITUD).map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
          </select>
        </div>
      </div>

      {cargando && <EstadoCarga texto="Cargando tus solicitudes…" />}
      {error && <EstadoError error={error} onReintentar={recargar} />}
      {datos && !cargando && datos.items.length === 0 && (
        <EstadoVacio titulo="No hay solicitudes para mostrar" accion={<Link className="btn btn-outline-primary btn-sm" to="/iniciativas">Explorar iniciativas</Link>} />
      )}
      {datos && !cargando && datos.items.map((s) => (
        <article key={s.id} className="card mb-3">
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <h2 className="h6 mb-1"><Link to={`/iniciativas/${s.initiative.id}`}>{s.initiative.title}</Link></h2>
              <BadgeSolicitud estado={s.status} />
            </div>
            <p className="small text-body-secondary mb-2">
              {s.role.name} · {s.offeredSkill.name} · {s.availability} · enviada {formatearFecha(s.createdAt)}
            </p>
            <p className="mb-2">{s.message}</p>
            {s.decision?.comment && <p className="small mb-2"><strong>Respuesta del propietario:</strong> {s.decision.comment}</p>}
            {s.status === 'pending' && (
              <div className="d-flex gap-2">
                <Link className="btn btn-sm btn-outline-primary" to={`/solicitudes/${s.id}/editar`}><i className="bi bi-pencil" aria-hidden="true"></i> Modificar</Link>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPorCancelar(s)}><i className="bi bi-x-circle" aria-hidden="true"></i> Cancelar solicitud</button>
              </div>
            )}
          </div>
        </article>
      ))}
      {datos && !cargando && <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={setPagina} />}

      <ModalConfirmacion
        abierto={!!porCancelar} titulo="Cancelar solicitud" textoConfirmar="Cancelar solicitud" procesando={procesando}
        onConfirmar={confirmarCancelacion} onCancelar={() => setPorCancelar(null)}
      >
        <p className="mb-0">¿Cancelar tu solicitud para <strong>{porCancelar?.initiative.title}</strong>? Quedará registrada como cancelada.</p>
      </ModalConfirmacion>
    </>
  );
}