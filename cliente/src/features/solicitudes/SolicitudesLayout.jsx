import { NavLink, Outlet } from 'react-router-dom';

export default function SolicitudesLayout() {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Solicitudes de participación</h1>
      <nav className="nav nav-tabs mb-3" aria-label="Tipo de solicitudes">
        <NavLink className="nav-link" to="/solicitudes" end><i className="bi bi-send" aria-hidden="true"></i> Enviadas</NavLink>
        <NavLink className="nav-link" to="/solicitudes/recibidas"><i className="bi bi-inbox" aria-hidden="true"></i> Recibidas</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}