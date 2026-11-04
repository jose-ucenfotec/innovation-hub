import { useConsulta } from '../../hooks/useConsulta.js';
import { obtenerRepositorio } from '../../api/github.js';
import { formatearFecha } from '../../utils/fechas.js';

const ICONOS_ERROR = {
  inexistente: 'bi-question-circle', privado: 'bi-lock-fill', limite: 'bi-hourglass-split',
  'no-disponible': 'bi-cloud-slash', invalida: 'bi-file-earmark-x', http: 'bi-exclamation-triangle',
};

export default function RepositorioGithub({ url }) {
  const { cargando, error, datos, recargar } = useConsulta((signal) => obtenerRepositorio(url, signal), [url]);

  return (
    <section className="card" aria-labelledby="t-repo">
      <div className="card-body">
        <h2 id="t-repo" className="h5"><i className="bi bi-github" aria-hidden="true"></i> Repositorio</h2>
        {cargando && <p className="small text-body-secondary mb-0" role="status"><span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Consultando GitHub…</p>}
        {error && (
          <div className="alert alert-warning d-flex gap-2 mb-0" role="alert">
            <i className={`bi ${ICONOS_ERROR[error.tipo] ?? 'bi-exclamation-triangle'}`} aria-hidden="true"></i>
            <div>
              {error.message}
              {['limite', 'no-disponible'].includes(error.tipo) && (
                <button type="button" className="btn btn-link btn-sm p-0 ms-2 align-baseline" onClick={recargar}>Reintentar</button>
              )}
            </div>
          </div>
        )}
        {datos && (
          <dl className="row mb-0 small">
            <dt className="col-sm-5">Nombre</dt><dd className="col-sm-7">{datos.nombre}</dd>
            <dt className="col-sm-5">Propietario</dt><dd className="col-sm-7">{datos.propietario}</dd>
            <dt className="col-sm-5">Descripción</dt><dd className="col-sm-7">{datos.descripcion || 'Sin descripción'}</dd>
            <dt className="col-sm-5">Lenguaje principal</dt><dd className="col-sm-7">{datos.lenguaje || 'No indicado'}</dd>
            <dt className="col-sm-5">Rama principal</dt><dd className="col-sm-7">{datos.rama}</dd>
            <dt className="col-sm-5">Última actualización</dt><dd className="col-sm-7">{formatearFecha(datos.actualizado)}</dd>
            <dt className="col-sm-5">Issues abiertos</dt><dd className="col-sm-7">{datos.issuesAbiertos}</dd>
            <dt className="col-sm-5">Enlace</dt>
            <dd className="col-sm-7"><a href={datos.enlace} target="_blank" rel="noopener noreferrer">Abrir en GitHub <i className="bi bi-box-arrow-up-right" aria-hidden="true"></i></a></dd>
          </dl>
        )}
      </div>
    </section>
  );
}