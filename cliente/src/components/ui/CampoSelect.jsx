export default function CampoSelect({
  id, etiqueta, valor, onChange, onBlur, error, requerido = false, opciones, vacio = 'Elegí una opción…', ayuda, className = 'mb-3',
}) {
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  return (
    <div className={className}>
      <label className="form-label" htmlFor={id}>
        {etiqueta}{requerido && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      <select
        id={id} className={`form-select${error ? ' is-invalid' : ''}`} value={valor ?? ''}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
        aria-invalid={Boolean(error)} aria-required={requerido || undefined}
        aria-describedby={[ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ') || undefined}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
      {ayuda && <div id={idAyuda} className="form-text">{ayuda}</div>}
      {error && <div id={idError} className="invalid-feedback d-block"><i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> {error}</div>}
    </div>
  );
}