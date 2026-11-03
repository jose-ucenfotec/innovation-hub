export default function EstadoVacio({ titulo, imagen = '/img/vacio-catalogo.svg', children, accion }) {
  return (
    <div className="estado-vacio text-center py-5" role="status">
      <img src={imagen} alt="" width="200" height="145" className="mb-3" />
      <h2 className="h5">{titulo}</h2>
      {children && <p className="text-body-secondary mb-3">{children}</p>}
      {accion}
    </div>
  );
}