import { ErrorApi } from '../api/errores.js';
import {
  nivelDeAcceso, esPropietario, esMiembro, integrantes, espaciosDisponibles,
  verificarSolicitud, verificarConversion, competenciasOfrecibles,
} from './reglas.js';
import {
  nombreCompleto, serializarIniciativa, serializarSolicitud, serializarProyecto,
  serializarUsuarioPublico, serializarUsuarioPropio,
} from './serializar.js';

const CLAVE = 'ih.mock.v1';
const COLECCIONES = ['categories', 'skills', 'roles', 'users', 'initiatives', 'requests', 'projects'];
let db = null;
let cargando = null;

// Se guarda la promesa: si llegan varias peticiones a la vez, los JSON se descargan una sola vez.
function cargar() {
  cargando ??= (async () => {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) { db = JSON.parse(guardado); return; }
    const partes = await Promise.all(COLECCIONES.map(async (nombre) => {
      const respuesta = await fetch(`/mock/${nombre}.json`);
      if (!respuesta.ok) throw new ErrorApi(500, 'INTERNAL_ERROR', `No se pudo cargar ${nombre}.json`);
      return respuesta.json();
    }));
    db = Object.fromEntries(COLECCIONES.map((nombre, i) => [nombre, partes[i]]));
  })().catch((error) => { cargando = null; throw error; });
  return cargando;
}
const guardar = () => localStorage.setItem(CLAVE, JSON.stringify(db));
export function reiniciarDatosMock() { localStorage.removeItem(CLAVE); db = null; cargando = null; }

const ahora = () => new Date().toISOString();
const nuevoId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
const fallo = (status, code, message, details = []) => new ErrorApi(status, code, message, details);

// ---------- utilidades comunes ----------
function exigirUsuario(usuario) {
  if (!usuario) throw fallo(401, 'UNAUTHORIZED', 'Necesitás iniciar sesión.');
}
function requeridos(cuerpo, campos) {
  const vacio = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
  const details = campos.filter((c) => vacio(cuerpo[c])).map((field) => ({ field, message: 'Este campo es obligatorio.' }));
  if (details.length) throw fallo(400, 'VALIDATION_ERROR', 'Hay datos inválidos.', details);
}
function iniciativaVisible(id, usuario) {
  const ini = db.initiatives.find((i) => i.id === id);
  const nivel = ini ? nivelDeAcceso(ini, usuario) : 'none';
  if (nivel === 'none') throw fallo(404, 'NOT_FOUND', 'La iniciativa no existe.');
  if (nivel === 'login') throw fallo(401, 'UNAUTHORIZED', 'Esta iniciativa es institucional: iniciá sesión para verla.');
  return { ini, nivel };
}
function iniciativaPropia(id, usuario) {
  exigirUsuario(usuario);
  const { ini } = iniciativaVisible(id, usuario);
  if (!esPropietario(ini, usuario)) throw fallo(403, 'FORBIDDEN', 'Solo el propietario puede realizar esta acción.');
  return ini;
}
function paginar(lista, query) {
  const size = Math.min(50, Math.max(1, parseInt(query.size, 10) || 12));
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const totalItems = lista.length;
  return { items: lista.slice((page - 1) * size, page * size), page, size, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / size)) };
}
function ordenar(lista, sort, permitidos, porDefecto) {
  const valor = sort && permitidos.includes(sort.replace(/^-/, '')) ? sort : porDefecto;
  const campo = valor.replace(/^-/, '');
  const direccion = valor.startsWith('-') ? -1 : 1;
  return [...lista].sort((a, b) => String(a[campo]).localeCompare(String(b[campo]), 'es') * direccion);
}
function validarSolicitudContenido(cuerpo, ini, usuario) {
  requeridos(cuerpo, ['message', 'offeredSkillId', 'roleId', 'availability']);
  const details = [];
  if (!competenciasOfrecibles(ini, usuario).includes(cuerpo.offeredSkillId)) {
    details.push({ field: 'offeredSkillId', message: 'Elegí una competencia que la iniciativa requiera y que tengas en tu perfil.' });
  }
  if (!db.roles.some((r) => r.id === cuerpo.roleId)) details.push({ field: 'roleId', message: 'Elegí un rol válido.' });
  if (details.length) throw fallo(400, 'VALIDATION_ERROR', 'Hay datos inválidos.', details);
}

// ---------- iniciativas ----------
const CAMPOS_INICIATIVA = ['title', 'type', 'summary', 'description', 'problem', 'beneficiaries', 'categoryId', 'requiredSkillIds', 'estimatedMembers', 'visibility'];

function listarIniciativas({ query, usuario }) {
  let lista = db.initiatives.filter((i) => nivelDeAcceso(i, usuario) !== 'none');
  if (query.owner === 'me') lista = lista.filter((i) => esPropietario(i, usuario));
  else if (query.owner) lista = lista.filter((i) => i.ownerId === query.owner);
  if (query.member === 'me') lista = lista.filter((i) => esMiembro(i, usuario));
  const soloMias = query.owner === 'me' || query.member === 'me';
  if (query.status) lista = lista.filter((i) => i.status === query.status);
  else if (!soloMias) lista = lista.filter((i) => !['draft', 'archived'].includes(i.status));
  if (query.type) lista = lista.filter((i) => i.type === query.type);
  if (query.category) lista = lista.filter((i) => i.categoryId === query.category);
  if (query.skill) lista = lista.filter((i) => i.requiredSkillIds.includes(query.skill));
  if (query.hasSpots === 'true') lista = lista.filter((i) => espaciosDisponibles(i) > 0);
  const texto = query.q?.trim().toLowerCase();
  if (texto) lista = lista.filter((i) => [i.title, i.summary, ...i.tags].some((t) => t.toLowerCase().includes(texto)));
  lista = ordenar(lista, query.sort, ['createdAt', 'updatedAt', 'title'], '-createdAt');
  const pagina = paginar(lista, query);
  return { ...pagina, items: pagina.items.map((i) => serializarIniciativa(i, db, usuario)) };
}

function obtenerIniciativa({ params: [id], usuario }) {
  const { ini } = iniciativaVisible(id, usuario);
  return serializarIniciativa(ini, db, usuario, { detalle: true });
}

function crearIniciativa({ cuerpo, usuario }) {
  exigirUsuario(usuario);
  requeridos(cuerpo, CAMPOS_INICIATIVA);
  const ini = {
    id: nuevoId(), ...Object.fromEntries(CAMPOS_INICIATIVA.map((c) => [c, cuerpo[c]])),
    tags: cuerpo.tags ?? [], ownerId: usuario.id, members: [], status: 'published', createdAt: ahora(), updatedAt: ahora(),
  };
  db.initiatives.push(ini);
  guardar();
  return serializarIniciativa(ini, db, usuario, { detalle: true });
}

function actualizarIniciativa({ params: [id], cuerpo, usuario }) {
  const ini = iniciativaPropia(id, usuario);
  if (ini.status === 'archived') throw fallo(409, 'ARCHIVED', 'Una iniciativa archivada no se puede modificar.');
  requeridos(cuerpo, CAMPOS_INICIATIVA);
  if (Number(cuerpo.estimatedMembers) < integrantes(ini)) {
    throw fallo(409, 'PARTICIPANTS_BELOW_TEAM', `El equipo ya tiene ${integrantes(ini)} integrantes, incluido el propietario.`);
  }
  CAMPOS_INICIATIVA.forEach((c) => { ini[c] = cuerpo[c]; });
  ini.tags = cuerpo.tags ?? [];
  ini.updatedAt = ahora();
  guardar();
  return serializarIniciativa(ini, db, usuario, { detalle: true });
}

function eliminarIniciativa({ params: [id], usuario }) {
  const ini = iniciativaPropia(id, usuario);
  const tieneRelaciones = ini.members.length > 0
    || db.requests.some((r) => r.initiativeId === id)
    || db.projects.some((p) => p.initiativeId === id);
  if (tieneRelaciones) throw fallo(409, 'HAS_RELATED_DATA', 'La iniciativa tiene equipo, solicitudes o proyecto: archivala en lugar de eliminarla.');
  db.initiatives = db.initiatives.filter((i) => i.id !== id);
  guardar();
}

function archivarIniciativa({ params: [id], usuario }) {
  const ini = iniciativaPropia(id, usuario);
  if (ini.status === 'archived') throw fallo(409, 'ARCHIVED', 'La iniciativa ya está archivada.');
  ini.status = 'archived';
  ini.updatedAt = ahora();
  guardar();
  return serializarIniciativa(ini, db, usuario, { detalle: true });
}

function listarMiembros({ params: [id], query, usuario }) {
  const { ini, nivel } = iniciativaVisible(id, usuario);
  if (nivel !== 'full') throw fallo(403, 'FORBIDDEN', 'No tenés acceso al equipo de esta iniciativa.');
  let miembros = serializarIniciativa(ini, db, usuario, { detalle: true }).members;
  if (query.role) miembros = miembros.filter((m) => m.role.id === query.role);
  if (query.skill) {
    miembros = miembros.filter((m) => db.users.find((u) => u.id === m.userId)?.skills.some((s) => s.skillId === query.skill));
  }
  return miembros;
}

function retirarMiembro({ params: [id, userId], usuario }) {
  const ini = iniciativaPropia(id, usuario);
  if (userId === ini.ownerId) throw fallo(409, 'CANNOT_REMOVE_OWNER', 'El propietario no puede retirarse del equipo.');
  if (!ini.members.some((m) => m.userId === userId)) throw fallo(404, 'NOT_FOUND', 'Esa persona no es miembro del equipo.');
  ini.members = ini.members.filter((m) => m.userId !== userId);
  if (ini.status === 'forming' && ini.members.length === 0) ini.status = 'published';
  ini.updatedAt = ahora();
  guardar();
}

function convertirEnProyecto({ params: [id], cuerpo, usuario }) {
  const ini = iniciativaPropia(id, usuario);
  const regla = verificarConversion(ini);
  if (regla) throw fallo(regla.status, regla.code, regla.message);
  requeridos(cuerpo, ['name', 'objective', 'description', 'startDate']);
  const proyecto = {
    id: nuevoId(), initiativeId: ini.id, name: cuerpo.name, objective: cuerpo.objective, description: cuerpo.description,
    technologies: cuerpo.technologies ?? [], startDate: cuerpo.startDate, estimatedEndDate: cuerpo.estimatedEndDate || null,
    repositoryUrl: cuerpo.repositoryUrl || null, status: 'planning', createdAt: ahora(), updatedAt: ahora(),
  };
  db.projects.push(proyecto);
  ini.status = 'project';
  ini.updatedAt = ahora();
  guardar();
  return serializarProyecto(proyecto, db, { detalle: true });
}

// ---------- solicitudes ----------
function crearSolicitud({ params: [id], cuerpo, usuario }) {
  exigirUsuario(usuario);
  const { ini } = iniciativaVisible(id, usuario);
  const pendientes = db.requests.filter((r) => r.initiativeId === id && r.userId === usuario.id && r.status === 'pending').length;
  const regla = verificarSolicitud(ini, usuario, pendientes);
  if (regla) throw fallo(regla.status, regla.code, regla.message);
  validarSolicitudContenido(cuerpo, ini, usuario);
  const solicitud = {
    id: nuevoId(), initiativeId: id, userId: usuario.id, message: cuerpo.message, offeredSkillId: cuerpo.offeredSkillId,
    roleId: cuerpo.roleId, availability: cuerpo.availability, status: 'pending', decisionComment: null, decidedAt: null,
    createdAt: ahora(), updatedAt: ahora(),
  };
  db.requests.push(solicitud);
  guardar();
  return serializarSolicitud(solicitud, db);
}

function filtrarSolicitudes(lista, query) {
  if (query.status) lista = lista.filter((r) => r.status === query.status);
  if (query.initiativeId) lista = lista.filter((r) => r.initiativeId === query.initiativeId);
  if (query.skill) lista = lista.filter((r) => r.offeredSkillId === query.skill);
  if (query.role) lista = lista.filter((r) => r.roleId === query.role);
  if (query.from) lista = lista.filter((r) => r.createdAt.slice(0, 10) >= query.from);
  if (query.to) lista = lista.filter((r) => r.createdAt.slice(0, 10) <= query.to);
  return ordenar(lista, query.sort, ['createdAt', 'updatedAt'], '-createdAt');
}

function misSolicitudes({ query, usuario }) {
  exigirUsuario(usuario);
  const pagina = paginar(filtrarSolicitudes(db.requests.filter((r) => r.userId === usuario.id), query), query);
  return { ...pagina, items: pagina.items.map((r) => serializarSolicitud(r, db)) };
}

function solicitudesRecibidas({ query, usuario }) {
  exigirUsuario(usuario);
  const propias = new Set(db.initiatives.filter((i) => i.ownerId === usuario.id).map((i) => i.id));
  const pagina = paginar(filtrarSolicitudes(db.requests.filter((r) => propias.has(r.initiativeId)), query), query);
  return { ...pagina, items: pagina.items.map((r) => serializarSolicitud(r, db)) };
}

function buscarSolicitud(id, usuario) {
  exigirUsuario(usuario);
  const solicitud = db.requests.find((r) => r.id === id);
  if (!solicitud) throw fallo(404, 'NOT_FOUND', 'La solicitud no existe.');
  const ini = db.initiatives.find((i) => i.id === solicitud.initiativeId);
  return { solicitud, ini, esSolicitante: solicitud.userId === usuario.id, esDueno: esPropietario(ini, usuario) };
}

function obtenerSolicitud({ params: [id], usuario }) {
  const { solicitud, esSolicitante, esDueno } = buscarSolicitud(id, usuario);
  if (!esSolicitante && !esDueno) throw fallo(403, 'FORBIDDEN', 'No tenés acceso a esta solicitud.');
  return serializarSolicitud(solicitud, db);
}

function solicitudPropiaPendiente(id, usuario) {
  const datos = buscarSolicitud(id, usuario);
  if (!datos.esSolicitante) throw fallo(403, 'FORBIDDEN', 'Solo quien envió la solicitud puede modificarla.');
  if (datos.solicitud.status !== 'pending') throw fallo(409, 'NOT_PENDING', 'Solo las solicitudes pendientes pueden modificarse.');
  return datos;
}

function actualizarSolicitud({ params: [id], cuerpo, usuario }) {
  const { solicitud, ini } = solicitudPropiaPendiente(id, usuario);
  validarSolicitudContenido(cuerpo, ini, usuario);
  Object.assign(solicitud, {
    message: cuerpo.message, offeredSkillId: cuerpo.offeredSkillId, roleId: cuerpo.roleId,
    availability: cuerpo.availability, updatedAt: ahora(),
  });
  guardar();
  return serializarSolicitud(solicitud, db);
}

function cancelarSolicitud({ params: [id], usuario }) {
  const { solicitud } = solicitudPropiaPendiente(id, usuario);
  solicitud.status = 'cancelled';
  solicitud.updatedAt = ahora();
  guardar();
  return serializarSolicitud(solicitud, db);
}

function decidirSolicitud({ params: [id], cuerpo, usuario }) {
  const { solicitud, ini, esDueno } = buscarSolicitud(id, usuario);
  if (!esDueno) throw fallo(403, 'FORBIDDEN', 'Solo el propietario de la iniciativa puede resolver solicitudes.');
  if (!['accepted', 'rejected'].includes(cuerpo.decision)) {
    throw fallo(400, 'VALIDATION_ERROR', 'Hay datos inválidos.', [{ field: 'decision', message: 'La decisión debe ser accepted o rejected.' }]);
  }
  if (solicitud.status !== 'pending') throw fallo(409, 'NOT_PENDING', 'La solicitud ya fue resuelta o cancelada.');
  if (cuerpo.decision === 'accepted') {
    if (!['published', 'forming'].includes(ini.status)) throw fallo(409, 'INITIATIVE_CLOSED', 'La iniciativa ya no recibe integrantes.');
    if (espaciosDisponibles(ini) === 0) throw fallo(409, 'NO_SPOTS', 'La iniciativa ya completó los espacios previstos.');
    // RN-14: aceptar incorpora automáticamente al equipo.
    ini.members.push({ userId: solicitud.userId, roleId: solicitud.roleId, joinedAt: ahora() });
    if (ini.status === 'published') ini.status = 'forming';
    ini.updatedAt = ahora();
  }
  Object.assign(solicitud, { status: cuerpo.decision, decisionComment: cuerpo.comment || null, decidedAt: ahora(), updatedAt: ahora() });
  guardar();
  return serializarSolicitud(solicitud, db);
}

// ---------- proyectos ----------
function proyectosAccesibles(usuario) {
  return db.projects.filter((p) => {
    const ini = db.initiatives.find((i) => i.id === p.initiativeId);
    return ini && nivelDeAcceso(ini, usuario) === 'full';
  });
}

function listarProyectos({ query, usuario }) {
  exigirUsuario(usuario);
  let lista = proyectosAccesibles(usuario);
  if (query.status) lista = lista.filter((p) => p.status === query.status);
  const pagina = paginar(ordenar(lista, query.sort, ['createdAt', 'name', 'startDate'], '-createdAt'), query);
  return { ...pagina, items: pagina.items.map((p) => serializarProyecto(p, db)) };
}

function obtenerProyecto({ params: [id], usuario }) {
  exigirUsuario(usuario);
  const proyecto = proyectosAccesibles(usuario).find((p) => p.id === id);
  if (!proyecto) throw fallo(404, 'NOT_FOUND', 'El proyecto no existe o no tenés acceso.');
  return serializarProyecto(proyecto, db, { detalle: true });
}

// ---------- usuarios ----------
const CAMPOS_PERFIL = ['firstName', 'lastName', 'secondLastName', 'career', 'bio', 'skills', 'interests', 'availability', 'portfolioUrl'];

function actualizarPerfil({ cuerpo, usuario }) {
  exigirUsuario(usuario);
  if (cuerpo.email !== undefined && cuerpo.email !== usuario.email) {
    throw fallo(400, 'VALIDATION_ERROR', 'Hay datos inválidos.', [{ field: 'email', message: 'El correo no se puede modificar desde el perfil.' }]);
  }
  requeridos(cuerpo, ['firstName', 'lastName', 'career']);
  CAMPOS_PERFIL.forEach((c) => { if (cuerpo[c] !== undefined) usuario[c] = cuerpo[c]; });
  usuario.updatedAt = ahora();
  guardar();
  return serializarUsuarioPropio(usuario, db);
}

function buscarUsuarios({ query, usuario }) {
  exigirUsuario(usuario);
  let lista = db.users.filter((u) => u.status === 'active');
  const texto = query.q?.trim().toLowerCase();
  if (texto) lista = lista.filter((u) => nombreCompleto(u).toLowerCase().includes(texto));
  if (query.skill) lista = lista.filter((u) => u.skills.some((s) => s.skillId === query.skill));
  if (query.career) lista = lista.filter((u) => u.career.toLowerCase().includes(query.career.trim().toLowerCase()));
  if (query.available === 'true') lista = lista.filter((u) => u.availability.hoursPerWeek > 0);
  const pagina = paginar(ordenar(lista, query.sort, ['firstName', 'lastName', 'createdAt'], 'firstName'), query);
  return { ...pagina, items: pagina.items.map((u) => serializarUsuarioPublico(u, db)) };
}

function obtenerUsuario({ params: [id], usuario }) {
  exigirUsuario(usuario);
  const encontrado = db.users.find((u) => u.id === id && u.status === 'active');
  if (!encontrado) throw fallo(404, 'NOT_FOUND', 'La persona no existe.');
  return serializarUsuarioPublico(encontrado, db);
}

// ---------- tabla de rutas: mismo verbo y ruta que el contrato ----------
const RUTAS = [
  ['GET', /^\/dev\/users$/, () => db.users.map((u) => ({ id: u.id, fullName: nombreCompleto(u) }))],
  ['GET', /^\/categories$/, () => db.categories],
  ['GET', /^\/skills$/, () => db.skills],
  ['GET', /^\/roles$/, () => db.roles],
  ['GET', /^\/auth\/me$/, ({ usuario }) => { exigirUsuario(usuario); return serializarUsuarioPropio(usuario, db); }],
  ['GET', /^\/users$/, buscarUsuarios],
  ['PUT', /^\/users\/me$/, actualizarPerfil],
  ['GET', /^\/users\/([^/]+)$/, obtenerUsuario],
  ['GET', /^\/initiatives$/, listarIniciativas],
  ['POST', /^\/initiatives$/, crearIniciativa],
  ['GET', /^\/initiatives\/([^/]+)$/, obtenerIniciativa],
  ['PUT', /^\/initiatives\/([^/]+)$/, actualizarIniciativa],
  ['DELETE', /^\/initiatives\/([^/]+)$/, eliminarIniciativa],
  ['POST', /^\/initiatives\/([^/]+)\/archive$/, archivarIniciativa],
  ['GET', /^\/initiatives\/([^/]+)\/members$/, listarMiembros],
  ['DELETE', /^\/initiatives\/([^/]+)\/members\/([^/]+)$/, retirarMiembro],
  ['POST', /^\/initiatives\/([^/]+)\/project$/, convertirEnProyecto],
  ['POST', /^\/initiatives\/([^/]+)\/requests$/, crearSolicitud],
  ['GET', /^\/requests\/mine$/, misSolicitudes],
  ['GET', /^\/requests\/received$/, solicitudesRecibidas],
  ['GET', /^\/requests\/([^/]+)$/, obtenerSolicitud],
  ['PUT', /^\/requests\/([^/]+)$/, actualizarSolicitud],
  ['POST', /^\/requests\/([^/]+)\/cancel$/, cancelarSolicitud],
  ['POST', /^\/requests\/([^/]+)\/decision$/, decidirSolicitud],
  ['GET', /^\/projects$/, listarProyectos],
  ['GET', /^\/projects\/([^/]+)$/, obtenerProyecto],
];

export async function atenderMock(metodo, url, cuerpo, cabeceras) {
  await cargar();
  await new Promise((resolver) => setTimeout(resolver, 250)); // latencia para ver el estado de carga
  const [ruta, cadena = ''] = url.split('?');
  const query = Object.fromEntries(new URLSearchParams(cadena));
  const usuario = db.users.find((u) => u.id === cabeceras['X-Dev-User']) ?? null;
  for (const [verbo, patron, manejador] of RUTAS) {
    const coincidencia = verbo === metodo ? ruta.match(patron) : null;
    if (coincidencia) {
      const resultado = manejador({ params: coincidencia.slice(1), query, cuerpo: structuredClone(cuerpo ?? {}), usuario });
      return resultado === undefined ? null : structuredClone(resultado);
    }
  }
  throw fallo(404, 'NOT_FOUND', 'La ruta no existe.');
}