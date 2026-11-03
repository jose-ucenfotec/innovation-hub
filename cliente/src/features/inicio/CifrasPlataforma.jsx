import { useConsulta } from '../../hooks/useConsulta.js';
import { listarIniciativas } from '../../api/iniciativas.js';
import { listarCategorias, listarCompetencias } from '../../api/catalogos.js';

export default function CifrasPlataforma() {
  const { cargando, error, datos } = useConsulta(
    (signal) => Promise.all([listarIniciativas({ size: 1 }, signal), listarCategorias(signal), listarCompetencias(signal)]),
    []
  );

  if (cargando) return <p className="text-center small text-body-secondary" role="status">Cargando cifras…</p>;
  if (error) return <p className="text-center small text-body-secondary" role="status">Las cifras no están disponibles en este momento.</p>;

  const [iniciativas, categorias, competencias] = datos;
  const cifras = [
    { valor: iniciativas.totalItems, texto: 'iniciativas abiertas' },
    { valor: categorias.length, texto: 'categorías' },
    { valor: competencias.length, texto: 'competencias en el catálogo' },
  ];
  return (
    <div className="row row-cols-1 row-cols-sm-3 g-3 text-center">
      {cifras.map((c) => (
        <div className="col" key={c.texto}>
          <div className="card"><div className="card-body">
            <p className="estadistica mb-1">{c.valor}</p>
            <p className="small text-body-secondary mb-0">{c.texto}</p>
          </div></div>
        </div>
      ))}
    </div>
  );
}