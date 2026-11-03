export default function Paginacion({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;
  const inicio = Math.max(1, Math.min(pagina - 2, totalPaginas - 4));
  const numeros = Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => inicio + i);

  return (
    <nav aria-label="Paginación de resultados" className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item${pagina === 1 ? ' disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1} aria-label="Página anterior">
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
        </li>
        {numeros.map((n) => (
          <li key={n} className={`page-item${n === pagina ? ' active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onCambiar(n)} aria-current={n === pagina ? 'page' : undefined}>{n}</button>
          </li>
        ))}
        <li className={`page-item${pagina === totalPaginas ? ' disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onCambiar(pagina + 1)} disabled={pagina === totalPaginas} aria-label="Página siguiente">
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}