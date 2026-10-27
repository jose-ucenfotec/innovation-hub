import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const ENLACES = [
  { to: '/', texto: 'Inicio', icono: 'bi-house', fin: true },
  { to: '/iniciativas', texto: 'Iniciativas', icono: 'bi-grid-3x3-gap' },
  { to: '/proyectos', texto: 'Proyectos', icono: 'bi-rocket-takeoff' },
];

// children para controles de la derecha (sesión, publicar)
export default function Navbar({ children }) {
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);

  return (
    <nav className="navbar navbar-expand-md" aria-label="Navegación principal">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={cerrar}>
          <img src="/img/logo.svg" alt="" width="28" height="28" />
          <span>Innovation Hub</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navPrincipal"
          aria-expanded={abierto}
          aria-label="Mostrar u ocultar la navegación"
          onClick={() => setAbierto((valor) => !valor)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse${abierto ? ' show' : ''}`} id="navPrincipal">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            {ENLACES.map((enlace) => (
              <li className="nav-item" key={enlace.to}>
                <NavLink className="nav-link" to={enlace.to} end={enlace.fin} onClick={cerrar}>
                  <i className={`bi ${enlace.icono}`} aria-hidden="true"></i> {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">{children}</div>
        </div>
      </div>
    </nav>
  );
}