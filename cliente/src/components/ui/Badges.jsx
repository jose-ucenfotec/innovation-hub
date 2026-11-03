import { TIPOS, ESTADOS, ESTADOS_SOLICITUD, ESTADOS_PROYECTO, VISIBILIDADES } from '../../utils/etiquetas.js';

// Icono + texto + color: el estado nunca depende solo del color.
function Badge({ definiciones, valor }) {
  const d = definiciones[valor] ?? { texto: valor, icono: 'bi-tag', color: 'light' };
  return (
    <span className={`badge text-bg-${d.color}${d.color === 'light' ? ' border' : ''}`}>
      <i className={`bi ${d.icono}`} aria-hidden="true"></i> {d.texto}
    </span>
  );
}

export const BadgeTipo = ({ tipo }) => <Badge definiciones={TIPOS} valor={tipo} />;
export const BadgeEstado = ({ estado }) => <Badge definiciones={ESTADOS} valor={estado} />;
export const BadgeSolicitud = ({ estado }) => <Badge definiciones={ESTADOS_SOLICITUD} valor={estado} />;
export const BadgeProyecto = ({ estado }) => <Badge definiciones={ESTADOS_PROYECTO} valor={estado} />;

export function ChipVisibilidad({ visibilidad }) {
  const d = VISIBILIDADES[visibilidad] ?? { texto: visibilidad, icono: 'bi-eye' };
  return <span className="chip"><i className={`bi ${d.icono}`} aria-hidden="true"></i> {d.texto}</span>;
}