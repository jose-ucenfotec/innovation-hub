export default function CampoCasilla({ id, etiqueta, valor, onChange, error, className = 'mb-3' }) {
  return (
    <div className={className}>
      <div className="form-check">
        <input
          id={id} type="checkbox" className={`form-check-input${error ? ' is-invalid' : ''}`} checked={Boolean(valor)}
          onChange={(e) => onChange(e.target.checked)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        />
        <label className="form-check-label" htmlFor={id}>{etiqueta}</label>
        {error && <div id={`${id}-error`} className="invalid-feedback d-block"><i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> {error}</div>}
      </div>
    </div>
  );
}