import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TarjetaPerfil from './TarjetaPerfil.jsx';
import ListaIniciativasPerfil from './ListaIniciativasPerfil.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { obtenerPerfilPropio, obtenerUsuario } from '../../api/usuarios.js';

const PESTANAS = [
  { id: 'propias', texto: 'Mis iniciativas', icono: 'bi-lightbulb', filtro: { owner: 'me' }, acciones: true, vacio: 'Todavía no publicaste iniciativas' },
  { id: 'participo', texto: 'Participo en', icono: 'bi-people', filtro: { member: 'me' }, acciones: false, vacio: 'Todavía no formás parte de ningún equipo' },
];

function Pestanas() {
  const [activa, setActiva] = useState(PESTANAS[0].id);
  const refs = useRef({});

  // Patrón de pestañas WAI-ARIA: flechas para moverse, una sola pestaña en el orden de tabulación.
  function alTeclear(e) {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const i = PESTANAS.findIndex((p) => p.id === activa);
    const siguiente = PESTANAS[(i + (e.key === 'ArrowRight' ? 1 : PESTANAS.length - 1)) % PESTANAS.length];
    setActiva(siguiente.id);
    refs.current[siguiente.id]?.focus();
  }

  const actual = PESTANAS.find((p) => p.id === activa);
  return (
    <>
      <div className="nav nav-tabs" role="tablist" aria-label="Actividad" onKeyDown={alTeclear}>
        {PESTANAS.map((p) => (
          <button
            key={p.id} id={`tab-${p.id}`} type="button" role="tab" ref={(el) => { refs.current[p.id] = el; }}
            className={`nav-link${p.id === activa ? ' active' : ''}`} aria-selected={p.id === activa}
            aria-controls="panel-perfil" tabIndex={p.id === activa ? 0 : -1} onClick={() => setActiva(p.id)}
          >
            <i className={`bi ${p.icono}`} aria-hidden="true"></i> {p.texto}
          </button>
        ))}
      </div>
      <div id="panel-perfil" role="tabpanel" aria-labelledby={`tab-${activa}`} tabIndex={0} className="pt-2">
        <ListaIniciativasPerfil key={actual.id} filtro={actual.filtro} conAcciones={actual.acciones} textoVacio={actual.vacio} />
      </div>
    </>
  );
}

export default function PerfilPage() {
  const { id } = useParams();
  const propio = !id;
  const { cargando, error, datos: persona, recargar } = useConsulta(
    (signal) => (propio ? obtenerPerfilPropio(signal) : obtenerUsuario(id, signal)),
    [id]
  );
  useTituloPagina(propio ? 'Mi perfil' : persona?.fullName ?? 'Perfil');

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">{propio ? 'Mi perfil' : 'Perfil'}</h1>
      {cargando && <EstadoCarga texto="Cargando perfil…" />}
      {error?.status === 404 && <EstadoVacio titulo="No encontramos a esa persona" />}
      {error && error.status !== 404 && <EstadoError error={error} onReintentar={recargar} />}
      {persona && (
        <div className="row g-4">
          <div className="col-md-5 col-lg-4">
            <TarjetaPerfil persona={persona} propio={propio}>
              {propio && <Link className="btn btn-outline-primary w-100 mt-3" to="/perfil/editar"><i className="bi bi-pencil" aria-hidden="true"></i> Editar perfil</Link>}
            </TarjetaPerfil>
          </div>
          <div className="col-md-7 col-lg-8">
            {propio ? <Pestanas /> : (
              <>
                <h2 className="h5">Iniciativas que publicó</h2>
                <ListaIniciativasPerfil filtro={{ owner: persona.id }} textoVacio="No tiene iniciativas visibles para vos" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}