import { Link } from 'react-router-dom';
import TarjetaPaso from './TarjetaPaso.jsx';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';

const PASOS = [
  { numero: 1, titulo: 'Explorá', imagen: '/img/paso-explorar.webp', alt: 'Lupa sobre tarjetas de iniciativas',
    texto: 'Buscá ideas, necesidades y retos por texto, tipo, categoría o competencia.' },
  { numero: 2, titulo: 'Publicá', imagen: '/img/paso-publicar.webp', alt: 'Persona lanzando una idea representada por una bombilla',
    texto: 'Registrá tu iniciativa con el problema, los beneficiarios y las competencias que necesitás.' },
  { numero: 3, titulo: 'Postulate', imagen: '/img/paso-postular.webp', alt: 'Mano entregando una pieza de rompecabezas que encaja',
    texto: 'Solicitá participar indicando qué competencia aportás, tu rol y tu disponibilidad.' },
  { numero: 4, titulo: 'Formá equipo', imagen: '/img/paso-equipo.webp', alt: 'Equipo interdisciplinario alrededor de una mesa con un cohete',
    texto: 'El autor acepta participantes y, con equipo, la iniciativa se convierte en proyecto.' },
];

export default function InicioPage() {
  useTituloPagina('Conectá ideas con personas');

  return (
    <>
      <section className="hero" aria-labelledby="t-hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7 text-center text-lg-start">
              <h1 id="t-hero">Conectá ideas con las personas que las hacen realidad</h1>
              <p className="lead mt-3 mb-4">
                Publicá ideas, necesidades y retos; encontrá las competencias que faltan y formá equipos
                interdisciplinarios dentro de la comunidad universitaria.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-start">
                <Link className="btn btn-light btn-lg" to="/iniciativas">
                  <i className="bi bi-search" aria-hidden="true"></i> Explorar iniciativas
                </Link>
                <Link className="btn btn-outline-light btn-lg" to="/iniciativas/nueva">
                  <i className="bi bi-plus-circle" aria-hidden="true"></i> Publicar una iniciativa
                </Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <img className="hero-imagen" src="/img/hero.webp" alt="Estudiantes de distintas carreras conectando ideas en una red" width="600" height="450" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5" aria-labelledby="t-como">
        <h2 id="t-como" className="h3 text-center mb-2">¿Cómo funciona?</h2>
        <p className="text-center text-body-secondary col-lg-8 mx-auto mb-4">
          Cuatro pasos para pasar de una idea suelta a un equipo trabajando.
        </p>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {PASOS.map((paso) => (
            <div className="col" key={paso.numero}>
              <TarjetaPaso numero={paso.numero} titulo={paso.titulo} imagen={paso.imagen} alt={paso.alt}>
                {paso.texto}
              </TarjetaPaso>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-5" aria-labelledby="t-caminos">
        <h2 id="t-caminos" className="visually-hidden">Publicar o participar</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <article className="card h-100">
              <div className="card-body">
                <h3 className="h5"><i className="bi bi-lightbulb-fill text-primary" aria-hidden="true"></i> Tenés una idea, una necesidad o un reto</h3>
                <ul className="small text-body-secondary mb-3">
                  <li>Describí el problema y a quién beneficia.</li>
                  <li>Indicá las competencias que buscás y cuántas personas necesitás.</li>
                  <li>Elegí la visibilidad: pública, institucional, restringida o privada.</li>
                  <li>Recibí solicitudes y armá tu equipo.</li>
                </ul>
                <Link className="btn btn-primary" to="/iniciativas/nueva">Publicar iniciativa <i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
              </div>
            </article>
          </div>
          <div className="col-md-6">
            <article className="card h-100">
              <div className="card-body">
                <h3 className="h5"><i className="bi bi-people-fill text-info" aria-hidden="true"></i> Querés sumarte a un proyecto real</h3>
                <ul className="small text-body-secondary mb-3">
                  <li>Completá tu perfil con competencias e intereses.</li>
                  <li>Filtrá el catálogo por lo que sabés hacer.</li>
                  <li>Enviá una solicitud con tu mensaje de presentación.</li>
                  <li>Cuando te acepten, pasás a formar parte del equipo.</li>
                </ul>
                <Link className="btn btn-outline-primary" to="/iniciativas">Ver iniciativas <i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}