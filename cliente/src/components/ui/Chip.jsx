import { NIVELES } from '../../utils/etiquetas.js';

export default function Chip({ icono, neutro = false, nivel, children }) {
  return (
    <span className={`chip${neutro ? ' chip--neutro' : ''}`}>
      {icono && <i className={`bi ${icono}`} aria-hidden="true"></i>} {children}
      {nivel && <span className="chip--nivel"> · {NIVELES[nivel] ?? nivel}</span>}
    </span>
  );
}