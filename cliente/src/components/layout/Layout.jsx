import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  // Al cambiar de ruta, la nueva pantalla empieza arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="visually-hidden-focusable position-absolute top-0 start-0 m-2 btn btn-primary btn-sm" href="#contenido">
        Saltar al contenido
      </a>
      <header>
        <Navbar>
          <Link className="btn btn-primary btn-sm" to="/iniciativas/nueva">
            <i className="bi bi-plus-circle-fill" aria-hidden="true"></i> Publicar iniciativa
          </Link>
        </Navbar>
      </header>
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}