import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSesion } from '../../context/SesionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function ControlesSesion() {
  const { usuario, cerrarSesion } = useSesion();
  const navigate = useNavigate();
  const mostrarToast = useToast();

  if (!usuario) {
    return (
      <>
        <NavLink className="nav-link" to="/login"><i className="bi bi-box-arrow-in-right" aria-hidden="true"></i> Iniciar sesión</NavLink>
        <Link className="btn btn-primary btn-sm" to="/registro">Crear cuenta</Link>
      </>
    );
  }

  async function salir() {
    await cerrarSesion();
    mostrarToast('Sesión cerrada.', 'secondary');
    navigate('/');
  }

  return (
    <>
      <NavLink className="nav-link" to="/usuarios"><i className="bi bi-people" aria-hidden="true"></i> Personas</NavLink>
      <NavLink className="nav-link" to="/solicitudes"><i className="bi bi-send" aria-hidden="true"></i> Solicitudes</NavLink>
      <NavLink className="nav-link" to="/perfil"><i className="bi bi-person-circle" aria-hidden="true"></i> {usuario.firstName}</NavLink>
      <Link className="btn btn-primary btn-sm" to="/iniciativas/nueva"><i className="bi bi-plus-circle-fill" aria-hidden="true"></i> Publicar</Link>
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={salir}>
        <i className="bi bi-box-arrow-right" aria-hidden="true"></i> Salir
      </button>
    </>
  );
}