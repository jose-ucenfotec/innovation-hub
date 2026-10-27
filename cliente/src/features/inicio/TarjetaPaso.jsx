export default function TarjetaPaso({ numero, titulo, imagen, alt, children }) {
  return (
    <article className="card h-100 text-center">
      <div className="card-body">
        <img className="paso-imagen mb-3" src={imagen} alt={alt} width="240" height="180" loading="lazy" />
        <span className="paso-numero mx-auto mb-3" aria-hidden="true">{numero}</span>
        <h3 className="h6">{titulo}</h3>
        <p className="small text-body-secondary mb-0">{children}</p>
      </div>
    </article>
  );
}