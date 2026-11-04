import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltrosIniciativas from './FiltrosIniciativas.jsx';
import TarjetaIniciativa from './TarjetaIniciativa.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { listarIniciativas } from '../../api/iniciativas.js';
import { listarCategorias, listarCompetencias } from '../../api/catalogos.js';

const CLAVES = ['q', 'type', 'category', 'skill', 'hasSpots', 'sort'];
const TAMANO_PAGINA = 9;

export default function CatalogoPage() {
  useTituloPagina('Catálogo de iniciativas');
  const [params, setParams] = useSearchParams();
  const filtros = Object.fromEntries(CLAVES.map((k) => [k, params.get(k) ?? '']));
  const pagina = Number(params.get('page')) || 1;

  const catalogos = useConsulta((signal) => Promise.all([listarCategorias(signal), listarCompetencias(signal)]), []);
  const resultado = useConsulta(
    (signal) => listarIniciativas({ ...filtros, page: pagina, size: TAMANO_PAGINA }, signal),
    [params.toString()]
  );

  // Estado elevado: los filtros viven aquí (en la URL) y bajan por props.
  // Cambiar un filtro reinicia la página a 1.
  const cambiarFiltros = useCallback((nuevos) => {
    setParams((actuales) => {
      const siguiente = { ...Object.fromEntries(actuales), ...nuevos };
      delete siguiente.page;
      return Object.fromEntries(Object.entries(siguiente).filter(([, v]) => v));
    });
  }, [setParams]);

  const cambiarPagina = (numero) => setParams((actuales) => ({ ...Object.fromEntries(actuales), page: String(numero) }));

  const [categorias, competencias] = catalogos.datos ?? [[], []];
  const datos = resultado.datos;

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Catálogo de iniciativas</h1>
          <p className="text-body-secondary mb-0">Ideas, necesidades y retos que buscan equipo.</p>
        </div>
        <p className="mb-0 small text-body-secondary" aria-live="polite">
          {datos && `${datos.totalItems} ${datos.totalItems === 1 ? 'iniciativa' : 'iniciativas'}`}
        </p>
      </div>

      {catalogos.error
        ? <EstadoError error={catalogos.error} titulo="No se pudieron cargar los filtros" onReintentar={catalogos.recargar} />
        : <FiltrosIniciativas valores={filtros} categorias={categorias} competencias={competencias} onCambiar={cambiarFiltros} />}

      {resultado.cargando && <EstadoCarga texto="Buscando iniciativas…" />}
      {resultado.error && <EstadoError error={resultado.error} onReintentar={resultado.recargar} />}
      {datos && !resultado.cargando && datos.items.length === 0 && (
        <EstadoVacio
          titulo="No encontramos iniciativas con esos criterios"
          accion={<button type="button" className="btn btn-outline-primary btn-sm" onClick={() => cambiarFiltros({ q: '', type: '', category: '', skill: '', hasSpots: '' })}>Limpiar filtros</button>}
        >
          Probá con otra palabra o quitá algún filtro.
        </EstadoVacio>
      )}
      {datos && !resultado.cargando && datos.items.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {datos.items.map((ini) => (
              <div className="col" key={ini.id}>
                <TarjetaIniciativa ini={ini} onCambio={resultado.recargar} />
              </div>
            ))}
          </div>
          <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={cambiarPagina} />
        </>
      )}
    </div>
  );
}