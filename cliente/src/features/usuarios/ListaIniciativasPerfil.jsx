import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeEstado, BadgeTipo } from '../../components/ui/Badges.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Paginacion from '../../components/ui/Paginacion.jsx';
import AccionesPropietario from '../iniciativas/AccionesPropietario.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { listarIniciativas } from '../../api/iniciativas.js';

export default function ListaIniciativasPerfil({ filtro, conAcciones = false, textoVacio }) {
  const [pagina, setPagina] = useState(1);
  const { cargando, error, datos, recargar } = useConsulta(
    (signal) => listarIniciativas({ ...filtro, page: pagina, size: 8 }, signal),
    [JSON.stringify(filtro), pagina]
  );

  if (cargando) return <EstadoCarga />;
  if (error) return <EstadoError error={error} onReintentar={recargar} />;
  if (datos.items.length === 0) return <EstadoVacio titulo={textoVacio} />;

  return (
    <>
      {datos.items.map((ini) => (
        <div key={ini.id} className="fila-lista flex-wrap">
          <span>
            <Link className="fw-semibold d-block" to={`/iniciativas/${ini.id}`}>{ini.title}</Link>
            <span className="small text-body-secondary">
              <i className={`bi ${ini.category?.icon ?? 'bi-tag'}`} aria-hidden="true"></i> {ini.category?.name}
              {ini.accessLevel === 'full' && ` · ${ini.memberCount} de ${ini.estimatedMembers} integrantes previstos`}
            </span>
          </span>
          <span className="d-flex flex-wrap gap-2 align-items-center">
            <BadgeTipo tipo={ini.type} />
            {ini.accessLevel === 'full' && <BadgeEstado estado={ini.status} />}
            {conAcciones && <AccionesPropietario ini={ini} variante="tarjeta" onCambio={recargar} />}
          </span>
        </div>
      ))}
      <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={setPagina} />
    </>
  );
}