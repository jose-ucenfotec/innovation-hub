// Genera innovation-hub.postman_collection.json y innovation-hub.postman_environment.json.
// Uso: node pruebas/generar-coleccion.mjs
import { writeFileSync } from 'node:fs';

const MODO_AUTH = 'jwt';

const ID = {
  ana: '650000000000000000000001', luis: '650000000000000000000002', maria: '650000000000000000000003', diego: '650000000000000000000004',
  voluntariado: '660000000000000000000001', energia: '660000000000000000000002', tutorias: '660000000000000000000003',
  reciclaje: '660000000000000000000004', soporte: '660000000000000000000005', coworking: '660000000000000000000006',
  bienestar: '660000000000000000000007', festival: '660000000000000000000008',
  solicitudVoluntariado: '670000000000000000000003', proyectoEnergia: '680000000000000000000001',
  inexistente: '6a0000000000000000000099',
};
const CONTRASENA_PRUEBA = 'Prueba123!';
const CORREOS = { ana: 'ana.mora@ucenfotec.ac.cr', luis: 'luis.perez@ucenfotec.ac.cr', maria: 'maria.solis@ucenfotec.ac.cr', diego: 'diego.vargas@ucenfotec.ac.cr' };

function cabeceras(quien) {
  const lista = [{ key: 'Content-Type', value: 'application/json' }];
  if (!quien) return lista;
  lista.push(MODO_AUTH === 'jwt'
    ? { key: 'Authorization', value: `Bearer {{token_${quien}}}` }
    : { key: 'X-Dev-User', value: ID[quien] });
  return lista;
}

function caso(nombre, metodo, ruta, { quien = null, cuerpo, estado, codigo, extra = [] } = {}) {
  const pruebas = [`pm.test('Responde ${estado}', () => pm.response.to.have.status(${estado}));`];
  if (codigo) pruebas.push(`pm.test('Código de error ${codigo}', () => pm.expect(pm.response.json().error.code).to.eql('${codigo}'));`);
  pruebas.push(...extra);
  return {
    name: nombre,
    event: [{ listen: 'test', script: { type: 'text/javascript', exec: pruebas } }],
    request: {
      method: metodo,
      header: cabeceras(quien),
      url: `{{baseUrl}}${ruta}`,
      ...(cuerpo !== undefined && { body: { mode: 'raw', raw: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo, null, 2) } }),
    },
  };
}

const guardar = (variable, expresion = 'pm.response.json().id') => `pm.collectionVariables.set('${variable}', ${expresion});`;
const carpeta = (name, item) => ({ name, item });

const iniciativaNueva = {
  title: 'Huerta comunitaria en el campus', type: 'idea',
  summary: 'Cultivar hortalizas con estudiantes y vecinos del campus.',
  description: 'Proponemos habilitar un espacio de huerta con turnos de cuidado y talleres abiertos a la comunidad.',
  problem: 'No existen espacios verdes productivos en el campus.', beneficiaries: 'Estudiantes y vecinos.',
  categoryId: 'cat-sostenibilidad', requiredSkillIds: ['comp-gestion'], estimatedMembers: 4, visibility: 'public', tags: ['huerta', 'comunidad'],
};
const solicitudMaria = { message: 'Puedo coordinar las actividades del espacio.', offeredSkillId: 'comp-gestion', roleId: 'rol-coordinacion', availability: '3 h/semana' };
const proyecto = {
  name: 'Plataforma de voluntariado', objective: 'Centralizar convocatorias de voluntariado del campus.',
  description: 'Aplicación web para publicar convocatorias, inscribirse y certificar horas de voluntariado.',
  technologies: ['React', 'Express'], startDate: '2026-11-10', estimatedEndDate: '2027-03-01', repositoryUrl: null,
};

const carpetas = [];

if (MODO_AUTH === 'jwt') {
  carpetas.push(carpeta('00 Preparación', Object.keys(CORREOS).map((quien) => caso(`Login ${quien}`, 'POST', '/auth/login', {
    cuerpo: { email: CORREOS[quien], password: CONTRASENA_PRUEBA }, estado: 200,
    extra: [guardar(`token_${quien}`, 'pm.response.json().token')],
  }))));

  carpetas.push(carpeta('01 Autenticación', [
    caso('Registro correcto', 'POST', '/auth/register', {
      cuerpo: { firstName: 'Sofía', lastName: 'Quesada', email: 'sofia.quesada@ucenfotec.ac.cr', password: 'Clave2026x', confirmPassword: 'Clave2026x', memberType: 'student', career: 'Diseño', acceptTerms: true },
      estado: 201, extra: ["pm.test('No devuelve contraseña', () => pm.expect(pm.response.json()).to.not.have.any.keys('password', 'passwordHash'));"],
    }),
    caso('Registro con datos inválidos', 'POST', '/auth/register', { cuerpo: { firstName: 'S', email: 'no-es-correo', password: '123', confirmPassword: '456', acceptTerms: false }, estado: 400, codigo: 'VALIDATION_ERROR' }),
    caso('Registro con correo existente', 'POST', '/auth/register', {
      cuerpo: { firstName: 'Otra', lastName: 'Persona', email: CORREOS.ana, password: 'Clave2026x', confirmPassword: 'Clave2026x', memberType: 'student', career: 'Diseño', acceptTerms: true },
      estado: 409, codigo: 'EMAIL_TAKEN',
    }),
    caso('Login con contraseña incorrecta', 'POST', '/auth/login', { cuerpo: { email: CORREOS.ana, password: 'incorrecta1' }, estado: 401, codigo: 'INVALID_CREDENTIALS' }),
    caso('Login de la cuenta nueva', 'POST', '/auth/login', { cuerpo: { email: 'sofia.quesada@ucenfotec.ac.cr', password: 'Clave2026x' }, estado: 200, extra: [guardar('token_sofia', 'pm.response.json().token')] }),
    caso('Perfil propio', 'GET', '/auth/me', { quien: 'sofia', estado: 200 }),
    caso('Perfil propio sin token', 'GET', '/auth/me', { estado: 401, codigo: 'UNAUTHORIZED' }),
    caso('Logout', 'POST', '/auth/logout', { quien: 'sofia', estado: 204 }),
    caso('Token revocado tras logout', 'GET', '/auth/me', { quien: 'sofia', estado: 401, codigo: 'UNAUTHORIZED' }),
  ]));

  carpetas.push(carpeta('02 Usuarios', [
    caso('Buscar por competencia y disponibilidad', 'GET', '/users?skill=comp-gestion&available=true', { quien: 'ana', estado: 200 }),
    caso('Buscar con tamaño inválido', 'GET', '/users?size=abc', { quien: 'ana', estado: 400, codigo: 'VALIDATION_ERROR' }),
    caso('Perfil inexistente', 'GET', `/users/${ID.inexistente}`, { quien: 'ana', estado: 404, codigo: 'NOT_FOUND' }),
    caso('Buscar sin token', 'GET', '/users', { estado: 401, codigo: 'UNAUTHORIZED' }),
    caso('Modificar perfil', 'PUT', '/users/me', {
      quien: 'diego', estado: 200,
      cuerpo: { firstName: 'Diego', lastName: 'Vargas', secondLastName: null, career: 'Administración', bio: 'Marketing para emprendimientos.', skills: [{ skillId: 'comp-marketing', level: 'advanced' }], interests: ['emprendimiento'], availability: { hoursPerWeek: 2, detail: 'viernes' }, portfolioUrl: null },
    }),
    caso('Modificar el correo desde el perfil', 'PUT', '/users/me', {
      quien: 'diego', estado: 400, codigo: 'VALIDATION_ERROR',
      cuerpo: { firstName: 'Diego', lastName: 'Vargas', career: 'Administración', email: 'otro@ucenfotec.ac.cr' },
    }),
  ]));
}

carpetas.push(carpeta('03 Catálogos', [
  caso('Categorías', 'GET', '/categories', { estado: 200, extra: ["pm.test('Ocho categorías', () => pm.expect(pm.response.json()).to.have.length(8));"] }),
  caso('Competencias', 'GET', '/skills', { estado: 200 }),
  caso('Roles', 'GET', '/roles', { estado: 200 }),
  caso('Ruta inexistente', 'GET', '/no-existe', { estado: 404, codigo: 'NOT_FOUND' }),
]));

carpetas.push(carpeta('04 Iniciativas', [
  caso('Listar con filtros combinados', 'GET', '/initiatives?type=challenge&category=cat-sostenibilidad&sort=title', {
    estado: 200, extra: ["pm.test('Sobre de paginación', () => pm.expect(pm.response.json()).to.have.all.keys('items', 'page', 'size', 'totalItems', 'totalPages'));"],
  }),
  caso('Tamaño de página limitado a 50', 'GET', '/initiatives?size=1000', { estado: 200, extra: ["pm.test('size = 50', () => pm.expect(pm.response.json().size).to.eql(50));"] }),
  caso('Listar con tipo inválido', 'GET', '/initiatives?type=cualquiera', { estado: 400, codigo: 'VALIDATION_ERROR' }),
  caso('Mis iniciativas sin token', 'GET', '/initiatives?owner=me', { estado: 401, codigo: 'UNAUTHORIZED' }),
  caso('Restringida vista por un tercero', 'GET', `/initiatives/${ID.soporte}`, {
    quien: 'ana', estado: 200,
    extra: ["pm.test('Solo el resumen', () => pm.expect(Object.keys(pm.response.json()).sort()).to.eql(['accessLevel','category','id','requiredSkills','summary','title','type','visibility']));"],
  }),
  caso('Privada vista por un tercero', 'GET', `/initiatives/${ID.bienestar}`, { quien: 'diego', estado: 404, codigo: 'NOT_FOUND' }),
  caso('Institucional sin sesión', 'GET', `/initiatives/${ID.tutorias}`, { estado: 401, codigo: 'UNAUTHORIZED' }),
  caso('Detalle inexistente', 'GET', `/initiatives/${ID.inexistente}`, { estado: 404, codigo: 'NOT_FOUND' }),
  caso('Crear', 'POST', '/initiatives', { quien: 'ana', cuerpo: iniciativaNueva, estado: 201, extra: [guardar('nuevaIniciativa'), "pm.test('Location', () => pm.response.to.have.header('Location'));"] }),
  caso('Crear con datos inválidos', 'POST', '/initiatives', { quien: 'ana', cuerpo: { ...iniciativaNueva, title: 'abc', estimatedMembers: 50, visibility: 'secreta' }, estado: 400, codigo: 'VALIDATION_ERROR' }),
  caso('Crear sin sesión', 'POST', '/initiatives', { cuerpo: iniciativaNueva, estado: 401, codigo: 'UNAUTHORIZED' }),
  caso('Modificar', 'PUT', '/initiatives/{{nuevaIniciativa}}', { quien: 'ana', cuerpo: { ...iniciativaNueva, estimatedMembers: 5 }, estado: 200 }),
  caso('Modificar iniciativa ajena', 'PUT', '/initiatives/{{nuevaIniciativa}}', { quien: 'luis', cuerpo: iniciativaNueva, estado: 403, codigo: 'FORBIDDEN' }),
  caso('Modificar inexistente', 'PUT', `/initiatives/${ID.inexistente}`, { quien: 'ana', cuerpo: iniciativaNueva, estado: 404, codigo: 'NOT_FOUND' }),
  caso('Integrantes menores que el equipo', 'PUT', `/initiatives/${ID.voluntariado}`, {
    quien: 'ana', estado: 409, codigo: 'PARTICIPANTS_BELOW_TEAM',
    cuerpo: { ...iniciativaNueva, title: 'Plataforma de voluntariado universitario', estimatedMembers: 1 },
  }),
  caso('Eliminar con información relacionada', 'DELETE', `/initiatives/${ID.voluntariado}`, { quien: 'ana', estado: 409, codigo: 'HAS_RELATED_DATA' }),
  caso('Eliminar iniciativa ajena', 'DELETE', '/initiatives/{{nuevaIniciativa}}', { quien: 'luis', estado: 403, codigo: 'FORBIDDEN' }),
  caso('Archivar', 'POST', '/initiatives/{{nuevaIniciativa}}/archive', { quien: 'ana', estado: 200, extra: ["pm.test('Archivada', () => pm.expect(pm.response.json().status).to.eql('archived'));"] }),
  caso('Modificar archivada', 'PUT', '/initiatives/{{nuevaIniciativa}}', { quien: 'ana', cuerpo: iniciativaNueva, estado: 409, codigo: 'ARCHIVED' }),
  caso('Eliminar sin relaciones', 'DELETE', '/initiatives/{{nuevaIniciativa}}', { quien: 'ana', estado: 204 }),
  caso('Eliminar inexistente', 'DELETE', `/initiatives/${ID.inexistente}`, { quien: 'ana', estado: 404, codigo: 'NOT_FOUND' }),
]));

carpetas.push(carpeta('05 Equipo', [
  caso('Listar miembros', 'GET', `/initiatives/${ID.voluntariado}/members`, { quien: 'ana', estado: 200 }),
  caso('Miembros de una restringida ajena', 'GET', `/initiatives/${ID.soporte}/members`, { quien: 'ana', estado: 403, codigo: 'FORBIDDEN' }),
  caso('Retirar al propietario', 'DELETE', `/initiatives/${ID.voluntariado}/members/${ID.ana}`, { quien: 'ana', estado: 409, codigo: 'CANNOT_REMOVE_OWNER' }),
  caso('Retirar sin ser propietario', 'DELETE', `/initiatives/${ID.coworking}/members/${ID.diego}`, { quien: 'ana', estado: 403, codigo: 'FORBIDDEN' }),
  caso('Retirar a quien no es miembro', 'DELETE', `/initiatives/${ID.voluntariado}/members/${ID.diego}`, { quien: 'ana', estado: 404, codigo: 'NOT_FOUND' }),
  caso('Retirar miembro', 'DELETE', `/initiatives/${ID.coworking}/members/${ID.diego}`, { quien: 'luis', estado: 204 }),
]));

carpetas.push(carpeta('06 Solicitudes', [
  caso('Crear solicitud', 'POST', `/initiatives/${ID.coworking}/requests`, { quien: 'maria', cuerpo: solicitudMaria, estado: 201, extra: [guardar('nuevaSolicitud')] }),
  caso('Solicitud duplicada pendiente', 'POST', `/initiatives/${ID.coworking}/requests`, { quien: 'maria', cuerpo: solicitudMaria, estado: 409, codigo: 'DUPLICATE_PENDING' }),
  caso('Competencia que no tiene', 'POST', `/initiatives/${ID.festival}/requests`, { quien: 'luis', cuerpo: { ...solicitudMaria, offeredSkillId: 'comp-redes' }, estado: 400, codigo: 'VALIDATION_ERROR' }),
  caso('Solicitar en la propia', 'POST', `/initiatives/${ID.voluntariado}/requests`, { quien: 'ana', cuerpo: solicitudMaria, estado: 409, codigo: 'SELF_REQUEST' }),
  caso('Solicitar en un proyecto', 'POST', `/initiatives/${ID.energia}/requests`, { quien: 'diego', cuerpo: solicitudMaria, estado: 409, codigo: 'INITIATIVE_CLOSED' }),
  caso('Solicitar en inexistente', 'POST', `/initiatives/${ID.inexistente}/requests`, { quien: 'maria', cuerpo: solicitudMaria, estado: 404, codigo: 'NOT_FOUND' }),
  caso('Solicitar sin sesión', 'POST', `/initiatives/${ID.coworking}/requests`, { cuerpo: solicitudMaria, estado: 401, codigo: 'UNAUTHORIZED' }),
  caso('Mis solicitudes', 'GET', '/requests/mine?status=pending', { quien: 'maria', estado: 200 }),
  caso('Recibidas con filtros', 'GET', `/requests/received?initiativeId=${ID.coworking}&status=pending`, { quien: 'luis', estado: 200 }),
  caso('Recibidas con fechas invertidas', 'GET', '/requests/received?from=2026-12-01&to=2026-01-01', { quien: 'luis', estado: 400, codigo: 'VALIDATION_ERROR' }),
  caso('Ver solicitud ajena', 'GET', '/requests/{{nuevaSolicitud}}', { quien: 'ana', estado: 403, codigo: 'FORBIDDEN' }),
  caso('Modificar pendiente', 'PUT', '/requests/{{nuevaSolicitud}}', { quien: 'maria', cuerpo: { ...solicitudMaria, availability: '4 h/semana' }, estado: 200 }),
  caso('Resolver sin ser propietario', 'POST', '/requests/{{nuevaSolicitud}}/decision', { quien: 'maria', cuerpo: { decision: 'accepted' }, estado: 403, codigo: 'FORBIDDEN' }),
  caso('Decisión inválida', 'POST', '/requests/{{nuevaSolicitud}}/decision', { quien: 'luis', cuerpo: { decision: 'tal vez' }, estado: 400, codigo: 'VALIDATION_ERROR' }),
  caso('Aceptar e incorporar', 'POST', '/requests/{{nuevaSolicitud}}/decision', { quien: 'luis', cuerpo: { decision: 'accepted', comment: 'Bienvenida' }, estado: 200 }),
  caso('Resolver de nuevo', 'POST', '/requests/{{nuevaSolicitud}}/decision', { quien: 'luis', cuerpo: { decision: 'rejected' }, estado: 409, codigo: 'NOT_PENDING' }),
  caso('Cancelar ya resuelta', 'POST', '/requests/{{nuevaSolicitud}}/cancel', { quien: 'maria', estado: 409, codigo: 'NOT_PENDING' }),
  caso('Cancelar pendiente', 'POST', `/requests/${ID.solicitudVoluntariado}/cancel`, { quien: 'maria', estado: 200 }),
  caso('Cancelar inexistente', 'POST', `/requests/${ID.inexistente}/cancel`, { quien: 'maria', estado: 404, codigo: 'NOT_FOUND' }),
]));

carpetas.push(carpeta('07 Proyectos', [
  caso('Convertir con datos inválidos', 'POST', `/initiatives/${ID.voluntariado}/project`, { quien: 'ana', cuerpo: { ...proyecto, name: '', estimatedEndDate: '2026-01-01' }, estado: 400, codigo: 'VALIDATION_ERROR' }),
  caso('Convertir sin ser propietario', 'POST', `/initiatives/${ID.voluntariado}/project`, { quien: 'luis', cuerpo: proyecto, estado: 403, codigo: 'FORBIDDEN' }),
  caso('Convertir sin integrantes', 'POST', `/initiatives/${ID.festival}/project`, { quien: 'diego', cuerpo: proyecto, estado: 409, codigo: 'NO_MEMBERS' }),
  caso('Convertir', 'POST', `/initiatives/${ID.voluntariado}/project`, { quien: 'ana', cuerpo: proyecto, estado: 201, extra: [guardar('nuevoProyecto')] }),
  caso('Convertir de nuevo', 'POST', `/initiatives/${ID.voluntariado}/project`, { quien: 'ana', cuerpo: proyecto, estado: 409, codigo: 'ALREADY_PROJECT' }),
  caso('Listar proyectos', 'GET', '/projects?sort=name', { quien: 'luis', estado: 200 }),
  caso('Detalle de proyecto', 'GET', '/projects/{{nuevoProyecto}}', { quien: 'luis', estado: 200, extra: ["pm.test('Conserva la iniciativa de origen', () => pm.expect(pm.response.json().initiative.id).to.eql('660000000000000000000001'));"] }),
  caso('Proyecto inexistente', 'GET', `/projects/${ID.inexistente}`, { quien: 'luis', estado: 404, codigo: 'NOT_FOUND' }),
  caso('Proyectos sin sesión', 'GET', '/projects', { estado: 401, codigo: 'UNAUTHORIZED' }),
]));

const coleccion = {
  info: {
    name: 'Innovation Hub API',
    description: 'Casos correctos, inválidos, inexistentes y no autorizados por recurso. Ejecutar después de npm run seed.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  event: [{
    listen: 'test',
    script: { type: 'text/javascript', exec: [
      "pm.test('Sin datos sensibles en la respuesta', () => {",
      "  const texto = pm.response.text();",
      "  // '\"password\":' detecta un valor filtrado; '\"field\":\"password\"' en un error de validación es legítimo.",
      "  ['passwordHash', '\"password\":', 'mongodb://', 'stack'].forEach((s) => pm.expect(texto).to.not.include(s));",
      '});',
      "if (pm.response.code >= 400) pm.test('Formato de error uniforme', () => pm.expect(pm.response.json().error).to.have.all.keys('code', 'message', 'details'));",
    ] },
  }],
  variable: [{ key: 'nuevaIniciativa', value: '' }, { key: 'nuevaSolicitud', value: '' }, { key: 'nuevoProyecto', value: '' }],
  item: carpetas,
};

const entorno = { name: 'Innovation Hub local', values: [{ key: 'baseUrl', value: 'http://localhost:3000/api', enabled: true }] };

const destino = new URL('.', import.meta.url);
writeFileSync(new URL('innovation-hub.postman_collection.json', destino), JSON.stringify(coleccion, null, 2));
writeFileSync(new URL('innovation-hub.postman_environment.json', destino), JSON.stringify(entorno, null, 2));
console.log(`Colección generada: ${carpetas.reduce((n, c) => n + c.item.length, 0)} peticiones en ${carpetas.length} carpetas.`);