import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ControlesSesion from './ControlesSesion.jsx';
import { useSesion } from '../../context/SesionContext.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const { usuario } = useSesion();

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
          <ControlesSesion />
        </Navbar>
      </header>
      <main id="contenido" tabIndex={-1}>
        <Outlet key={usuario?.id ?? 'visitante'} />
      </main>
      <Footer />
    </>
  );
}