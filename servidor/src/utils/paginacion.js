// Orden con lista blanca; _id desempata para que la paginación sea estable.
export function orden(sort, permitidos, porDefecto) {
  const valor = sort && permitidos.includes(sort.replace(/^-/, '')) ? sort : porDefecto;
  return { [valor.replace(/^-/, '')]: valor.startsWith('-') ? -1 : 1, _id: 1 };
}

// Nunca descarga la colección completa: cuenta y trae solo la página pedida.
export async function paginar(modelo, filtro, { page, size, sort }, permitidos, porDefecto) {
  const [items, totalItems] = await Promise.all([
    modelo.find(filtro).collation({ locale: 'es' }).sort(orden(sort, permitidos, porDefecto)).skip((page - 1) * size).limit(size).lean(),
    modelo.countDocuments(filtro),
  ]);
  return { items, page, size, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / size)) };
}

export const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');