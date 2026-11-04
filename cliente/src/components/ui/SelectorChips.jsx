import { useState } from 'react';
import ModalConfirmacion from './ModalConfirmacion.jsx';

export default function SelectorChips({
  id, etiqueta, valores, onChange, opciones = [], libre = false, max, requerido = false, error, ayuda,
  confirmarAlQuitar = false, validarNuevo, placeholder, className = 'mb-3',
}) {
  const [entrada, setEntrada] = useState('');
  const [errorEntrada, setErrorEntrada] = useState(null);
  const [porQuitar, setPorQuitar] = useState(null);

  const nombre = (v) => (libre ? v : opciones.find((o) => o.valor === v)?.texto ?? v);
  const mensaje = errorEntrada ?? error;
  const idMensaje = `${id}-error`;
  const idAyuda = `${id}-ayuda`;

  function agregar() {
    const valor = entrada.trim();
    if (!valor) return setErrorEntrada(libre ? 'Escribí un valor antes de agregar.' : 'Elegí una opción antes de agregar.');
    if (valores.includes(valor)) return setErrorEntrada('Ya está en la lista.');
    if (max && valores.length >= max) return setErrorEntrada(`Podés agregar como máximo ${max}.`);
    const problema = validarNuevo?.(valor);
    if (problema) return setErrorEntrada(problema);
    onChange([...valores, valor]);
    setEntrada('');
    setErrorEntrada(null);
    return undefined;
  }

  function alTeclear(e) {
    if (libre && (e.key === 'Enter' || e.key === ',')) {
      e.preventDefault();
      agregar();
    }
  }

  function quitar(valor) {
    onChange(valores.filter((v) => v !== valor));
    setPorQuitar(null);
  }

  const propsControl = {
    id, value: entrada,
    className: `${libre ? 'form-control' : 'form-select'}${mensaje ? ' is-invalid' : ''}`,
    onChange: (e) => { setEntrada(e.target.value); setErrorEntrada(null); },
    'aria-invalid': Boolean(mensaje),
    'aria-describedby': [ayuda ? idAyuda : null, mensaje ? idMensaje : null].filter(Boolean).join(' ') || undefined,
  };

  return (
    <div className={className}>
      <label className="form-label" htmlFor={id}>
        {etiqueta}{requerido && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      <div className="input-group">
        {libre ? (
          <input {...propsControl} onKeyDown={alTeclear} placeholder={placeholder} />
        ) : (
          <select {...propsControl}>
            <option value="">Elegí una opción…</option>
            {opciones.map((o) => <option key={o.valor} value={o.valor} disabled={valores.includes(o.valor)}>{o.texto}</option>)}
          </select>
        )}
        <button type="button" className="btn btn-outline-primary" onClick={agregar}>
          <i className="bi bi-plus-lg" aria-hidden="true"></i> Agregar
        </button>
      </div>
      {ayuda && <div id={idAyuda} className="form-text">{ayuda}{max ? ` (${valores.length} de ${max})` : ''}</div>}
      {mensaje && <div id={idMensaje} className="invalid-feedback d-block"><i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> {mensaje}</div>}
      <ul className="lista-chips mt-2" aria-label={`${etiqueta}: elementos agregados`}>
        {valores.map((v) => (
          <li key={v} className="badge text-bg-primary competencia-elegida">
            {nombre(v)}
            <button
              type="button" className="btn-close btn-close-white" aria-label={`Quitar ${nombre(v)}`}
              onClick={() => (confirmarAlQuitar ? setPorQuitar(v) : quitar(v))}
            ></button>
          </li>
        ))}
        {valores.length === 0 && <li className="small text-body-secondary">Todavía no agregaste ninguno.</li>}
      </ul>

      <ModalConfirmacion
        abierto={porQuitar !== null}
        titulo="Quitar de la lista"
        textoConfirmar="Quitar"
        variante="primary"
        icono="bi-question-circle"
        onConfirmar={() => quitar(porQuitar)}
        onCancelar={() => setPorQuitar(null)}
      >
        <p className="mb-0">¿Querés quitar <strong>{porQuitar !== null && nombre(porQuitar)}</strong> de {etiqueta.toLowerCase()}?</p>
      </ModalConfirmacion>
    </div>
  );
}