export default function CampoTexto({
  id, etiqueta, valor, onChange, onBlur, error, requerido = false, min, max,
  multilinea = false, filas = 3, tipo = 'text', placeholder, ayuda, className = 'mb-3', ...resto
}) {
  const largo = String(valor ?? '').trim().length;
  let contador = null;
  if (min && largo < min) contador = `Faltan ${min - largo} caracteres para el mínimo de ${min}.`;
  else if (max) contador = `${largo} / ${max}`;

  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const describe = [ayuda || contador ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ') || undefined;
  const control = {
    id, placeholder, onBlur,
    className: `form-control${error ? ' is-invalid' : ''}`,
    value: valor ?? '',
    onChange: (e) => onChange(e.target.value),
    'aria-invalid': Boolean(error),
    'aria-describedby': describe,
    'aria-required': requerido || undefined,
    ...resto,
  };

  return (
    <div className={className}>
      <label className="form-label" htmlFor={id}>
        {etiqueta}{requerido && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {multilinea ? <textarea rows={filas} {...control} /> : <input type={tipo} {...control} />}
      {(ayuda || contador) && (
        <div id={idAyuda} className="form-text d-flex justify-content-between gap-2">
          <span>{ayuda}</span>
          {contador && <span className={min && largo < min ? 'text-warning-emphasis' : ''}>{contador}</span>}
        </div>
      )}
      {error && (
        <div id={idError} className="invalid-feedback d-block">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> {error}
        </div>
      )}
    </div>
  );
}