export default function EstadoError({ error, titulo = 'No se pudo completar la consulta', onReintentar }) {
  const sinConexion = error?.status === 0;
  return (
    <div className="estado-error text-center py-5" role="alert">
      <img src="/img/error-carga.svg" alt="" width="220" height="160" className="mb-3" />
      <h2 className="h5">{titulo}</h2>
      <p className="text-body-secondary">
        {sinConexion ? 'No hay conexión con el servidor. Verificá que esté en ejecución.' : error?.message}
      </p>
      {onReintentar && (
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onReintentar}>
          <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Reintentar
        </button>
      )}
    </div>
  );
}