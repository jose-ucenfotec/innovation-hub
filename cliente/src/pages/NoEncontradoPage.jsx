import { Link } from 'react-router-dom';
import { useTituloPagina } from '../hooks/useTituloPagina.js';

export default function NoEncontradoPage() {
  useTituloPagina('Página no encontrada');
  return (
    <div className="container py-5 text-center estado-vacio">
      <img src="/img/vacio-catalogo.svg" alt="" width="220" height="160" className="mb-3" />
      <h1 className="h3">No encontramos esa página</h1>
      <p className="text-body-secondary">La dirección no existe o cambió.</p>
      <Link className="btn btn-primary" to="/">
        <i className="bi bi-house" aria-hidden="true"></i> Volver al inicio
      </Link>
    </div>
  );
}