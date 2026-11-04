import { useEffect, useState } from 'react';
import { opciones, TIPOS } from '../../utils/etiquetas.js';

const ORDENES = [
  { valor: '-createdAt', texto: 'Más recientes' },
  { valor: 'createdAt', texto: 'Más antiguas' },
  { valor: 'title', texto: 'Título (A–Z)' },
  { valor: '-updatedAt', texto: 'Actualizadas recientemente' },
];

export default function FiltrosIniciativas({ valores, categorias, competencias, onCambiar }) {
  const [texto, setTexto] = useState(valores.q);

  // Si la URL cambia desde afuera (por ejemplo al limpiar), el campo se sincroniza.
  useEffect(() => { setTexto(valores.q); }, [valores.q]);

  // Espera 350 ms sin teclear antes de buscar; la limpieza cancela el temporizador anterior.
  useEffect(() => {
    if (texto === valores.q) return undefined;
    const temporizador = setTimeout(() => onCambiar({ q: texto }), 350);
    return () => clearTimeout(temporizador);
  }, [texto, valores.q, onCambiar]);

  const seleccionar = (campo) => (e) => onCambiar({ [campo]: e.target.value });

  return (
    <form className="formulario-tarjeta row g-3 mb-4" role="search" aria-label="Buscar y filtrar iniciativas" onSubmit={(e) => e.preventDefault()}>
      <div className="col-12 col-lg-4">
        <label className="form-label" htmlFor="buscar"><i className="bi bi-search" aria-hidden="true"></i> Buscar</label>
        <input id="buscar" type="search" className="form-control" placeholder="Título, resumen o etiqueta" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </div>
      <div className="col-6 col-md-4 col-lg-2">
        <label className="form-label" htmlFor="f-tipo">Tipo</label>
        <select id="f-tipo" className="form-select" value={valores.type} onChange={seleccionar('type')}>
          <option value="">Todos</option>
          {opciones(TIPOS).map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-4 col-lg-3">
        <label className="form-label" htmlFor="f-categoria">Categoría</label>
        <select id="f-categoria" className="form-select" value={valores.category} onChange={seleccionar('category')}>
          <option value="">Todas</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="col-12 col-md-4 col-lg-3">
        <label className="form-label" htmlFor="f-competencia">Competencia</label>
        <select id="f-competencia" className="form-select" value={valores.skill} onChange={seleccionar('skill')}>
          <option value="">Todas</option>
          {competencias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="f-orden">Ordenar por</label>
        <select id="f-orden" className="form-select" value={valores.sort || '-createdAt'} onChange={seleccionar('sort')}>
          {ORDENES.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
        </select>
      </div>
      <div className="col-12 col-md-6 col-lg-4 d-flex align-items-end">
        <div className="form-check">
          <input id="f-espacios" type="checkbox" className="form-check-input" checked={valores.hasSpots === 'true'} onChange={(e) => onCambiar({ hasSpots: e.target.checked ? 'true' : '' })} />
          <label className="form-check-label" htmlFor="f-espacios">Solo con espacios disponibles</label>
        </div>
      </div>
      <div className="col-12 col-lg-4 d-flex align-items-end justify-content-lg-end">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onCambiar({ q: '', type: '', category: '', skill: '', hasSpots: '', sort: '' })}>
          <i className="bi bi-x-circle" aria-hidden="true"></i> Limpiar filtros
        </button>
      </div>
    </form>
  );
}