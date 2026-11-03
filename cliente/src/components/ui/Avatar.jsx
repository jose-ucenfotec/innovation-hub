const iniciales = (nombre = '?') => nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export default function Avatar({ nombre, grande = false }) {
  return (
    <span className={`avatar${grande ? ' avatar--lg' : ''}`} role="img" aria-label={nombre}>
      {iniciales(nombre)}
    </span>
  );
}