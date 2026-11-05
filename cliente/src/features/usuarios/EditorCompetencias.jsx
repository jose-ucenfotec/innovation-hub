import { useState } from 'react';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion.jsx';
import { NIVELES, opciones } from '../../utils/etiquetas.js';

export default function EditorCompetencias({ id = 'skills', valores, onChange, catalogo, error }) {
  const [nueva, setNueva] = useState({ skillId: '', level: 'basic' });
  const [aviso, setAviso] = useState(null);
  const [porQuitar, setPorQuitar] = useState(null);
  const nombre = (skillId) => catalogo.find((c) => c.id === skillId)?.name ?? skillId;
  const niveles = opciones(NIVELES);

  function agregar() {
    if (!nueva.skillId) return setAviso('Elegí una competencia.');
    if (valores.some((s) => s.skillId === nueva.skillId)) return setAviso('Esa competencia ya está en tu perfil.');
    onChange([...valores, nueva]);
    setNueva({ skillId: '', level: 'basic' });
    setAviso(null);
    return undefined;
  }

  const cambiarNivel = (skillId, level) => onChange(valores.map((s) => (s.skillId === skillId ? { ...s, level } : s)));
  const mensaje = aviso ?? error;

  return (
    <fieldset className="mb-3">
      <legend className="form-label fs-6">Competencias</legend>
      <div className="row g-2 align-items-end">
        <div className="col-sm-6">
          <label className="form-label small" htmlFor={id}>Competencia</label>
          <select id={id} className="form-select" value={nueva.skillId} onChange={(e) => { setNueva({ ...nueva, skillId: e.target.value }); setAviso(null); }}>
            <option value="">Elegí una competencia…</option>
            {catalogo.map((c) => <option key={c.id} value={c.id} disabled={valores.some((s) => s.skillId === c.id)}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-sm-4">
          <label className="form-label small" htmlFor={`${id}-nivel`}>Nivel</label>
          <select id={`${id}-nivel`} className="form-select" value={nueva.level} onChange={(e) => setNueva({ ...nueva, level: e.target.value })}>
            {niveles.map((n) => <option key={n.valor} value={n.valor}>{n.texto}</option>)}
          </select>
        </div>
        <div className="col-sm-2 d-grid">
          <button type="button" className="btn btn-outline-primary" onClick={agregar}><i className="bi bi-plus-lg" aria-hidden="true"></i> Agregar</button>
        </div>
      </div>
      {mensaje && <div className="invalid-feedback d-block"><i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> {mensaje}</div>}

      <ul className="list-unstyled mt-3 mb-0">
        {valores.map((s) => (
          <li key={s.skillId} className="fila-lista">
            <span className="fw-semibold">{nombre(s.skillId)}</span>
            <span className="d-flex gap-2 align-items-center">
              <label className="visually-hidden" htmlFor={`nivel-${s.skillId}`}>Nivel de {nombre(s.skillId)}</label>
              <select id={`nivel-${s.skillId}`} className="form-select form-select-sm" value={s.level} onChange={(e) => cambiarNivel(s.skillId, e.target.value)}>
                {niveles.map((n) => <option key={n.valor} value={n.valor}>{n.texto}</option>)}
              </select>
              <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Quitar ${nombre(s.skillId)}`} onClick={() => setPorQuitar(s.skillId)}>
                <i className="bi bi-trash3" aria-hidden="true"></i>
              </button>
            </span>
          </li>
        ))}
        {valores.length === 0 && <li className="small text-body-secondary">Todavía no registraste competencias.</li>}
      </ul>

      <ModalConfirmacion
        abierto={porQuitar !== null} titulo="Quitar competencia" textoConfirmar="Quitar"
        onConfirmar={() => { onChange(valores.filter((s) => s.skillId !== porQuitar)); setPorQuitar(null); }}
        onCancelar={() => setPorQuitar(null)}
      >
        <p className="mb-0">¿Quitar <strong>{porQuitar && nombre(porQuitar)}</strong> de tu perfil? La competencia sigue existiendo en el catálogo.</p>
      </ModalConfirmacion>
    </fieldset>
  );
}