import { Link, NavLink } from 'react-router-dom';
import { useSesion } from '../../context/SesionContext.jsx';
import SelectorSesion from './SelectorSesion.jsx';

export default function ControlesSesion() {
  const { usuario } = useSesion();
  return (
    <>
      {usuario && (
        <>
          <NavLink className="nav-link" to="/solicitudes"><i className="bi bi-send" aria-hidden="true"></i> Solicitudes</NavLink>
          <NavLink className="nav-link" to="/perfil"><i className="bi bi-person-circle" aria-hidden="true"></i> Mi perfil</NavLink>
        </>
      )}
      <SelectorSesion />
      <Link className="btn btn-primary btn-sm" to="/iniciativas/nueva">
        <i className="bi bi-plus-circle-fill" aria-hidden="true"></i> Publicar iniciativa
      </Link>
    </>
  );
}