export default function EstadoCarga({ texto = 'Cargando…' }) {
  return (
    <div className="text-center py-5" role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true"></div>
      <p className="small text-body-secondary mt-2 mb-0">{texto}</p>
    </div>
  );
}