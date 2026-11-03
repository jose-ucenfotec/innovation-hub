// Acepta "2026-09-08" o un ISO completo. Las fechas sin hora se leen como locales para no correr un día.
export function formatearFecha(valor) {
  if (!valor) return 'sin fecha';
  const fecha = valor.length === 10 ? new Date(`${valor}T00:00:00`) : new Date(valor);
  return fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
}