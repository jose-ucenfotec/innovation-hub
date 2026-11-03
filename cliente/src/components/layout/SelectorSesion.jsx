import { useSesion } from '../../context/SesionContext.jsx';

export default function SelectorSesion() {
  const { usuarioIdDev, usuariosDev, cambiarUsuario } = useSesion();
  return (
    <label className="ver-como mb-0" htmlFor="ver-como">
      <i className="bi bi-person-badge" aria-hidden="true"></i> Ver como
      <select id="ver-como" className="form-select form-select-sm" value={usuarioIdDev} onChange={(e) => cambiarUsuario(e.target.value)}>
        <option value="">Visitante</option>
        {usuariosDev.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
      </select>
    </label>
  );
}