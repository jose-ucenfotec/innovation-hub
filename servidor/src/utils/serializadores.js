import { nivelDeAcceso, esPropietario, integrantes, espaciosDisponibles } from '../services/reglas.js';

export const nombreCompleto = (u) => [u.firstName, u.lastName, u.secondLastName].filter(Boolean).join(' ');

function persona(ctx, id) {
  const u = ctx.usuarios.get(String(id));
  return { id: String(id), fullName: u ? nombreCompleto(u) : 'Usuario no disponible', career: u?.career ?? '' };
}
const competencia = (ctx, id) => ({ id, name: ctx.competencias.get(id)?.name ?? id });
const rol = (ctx, id) => ({ id, name: ctx.roles.get(id)?.name ?? id });

export function serializarUsuarioPublico(u, ctx) {
  return {
    id: String(u._id), firstName: u.firstName, lastName: u.lastName, secondLastName: u.secondLastName ?? null,
    fullName: nombreCompleto(u), memberType: u.memberType, career: u.career, bio: u.bio ?? '',
    skills: (u.skills ?? []).map((s) => ({ skillId: s.skillId, name: competencia(ctx, s.skillId).name, level: s.level })),
    interests: u.interests ?? [],
    availability: { hoursPerWeek: u.availability?.hoursPerWeek ?? 0, detail: u.availability?.detail ?? '' },
    portfolioUrl: u.portfolioUrl ?? null,
  };
}

// Nunca incluye passwordHash: el campo no existe en el objeto devuelto.
export const serializarUsuarioPropio = (u, ctx) => ({
  ...serializarUsuarioPublico(u, ctx), email: u.email, status: u.status, createdAt: u.createdAt, updatedAt: u.updatedAt,
});

export function serializarMiembro(m, ctx) {
  const p = persona(ctx, m.userId);
  return { userId: p.id, fullName: p.fullName, career: p.career, role: rol(ctx, m.roleId), joinedAt: m.joinedAt };
}

export function serializarIniciativa(ini, ctx, usuario, { detalle = false } = {}) {
  const categoria = ctx.categorias.get(ini.categoryId);
  const base = {
    id: String(ini._id),
    accessLevel: nivelDeAcceso(ini, usuario) === 'full' ? 'full' : 'summary',
    title: ini.title, type: ini.type, summary: ini.summary,
    category: categoria ? { id: categoria._id, name: categoria.name, icon: categoria.icon } : null,
    requiredSkills: ini.requiredSkillIds.map((id) => competencia(ctx, id)),
    visibility: ini.visibility,
  };
  if (base.accessLevel !== 'full') return base; // RN-03: nada más sale para una restringida ajena

  const proyecto = ctx.proyectos.get(String(ini._id));
  const duenio = persona(ctx, ini.ownerId);
  const completo = {
    ...base,
    tags: ini.tags, status: ini.status, estimatedMembers: ini.estimatedMembers,
    memberCount: integrantes(ini), availableSpots: espaciosDisponibles(ini),
    owner: { id: duenio.id, fullName: duenio.fullName },
    projectId: proyecto ? String(proyecto._id) : null,
    createdAt: ini.createdAt, updatedAt: ini.updatedAt,
  };
  if (detalle) {
    completo.description = ini.description;
    completo.problem = ini.problem;
    completo.beneficiaries = ini.beneficiaries;
    completo.members = ini.members.map((m) => serializarMiembro(m, ctx));
  }
  if (esPropietario(ini, usuario)) {
    completo.relations = { members: ini.members.length, requests: ctx.solicitudes.get(String(ini._id)) ?? 0, hasProject: Boolean(proyecto) };
  }
  return completo;
}

export function serializarSolicitud(s, ctx) {
  const ini = ctx.iniciativas.get(String(s.initiativeId));
  const solicitante = ctx.usuarios.get(String(s.userId));
  return {
    id: String(s._id),
    initiative: { id: String(s.initiativeId), title: ini?.title ?? 'Iniciativa eliminada' },
    applicant: solicitante
      ? { id: String(solicitante._id), fullName: nombreCompleto(solicitante), career: solicitante.career, skills: serializarUsuarioPublico(solicitante, ctx).skills }
      : { id: String(s.userId), fullName: 'Usuario no disponible', career: '', skills: [] },
    message: s.message, offeredSkill: competencia(ctx, s.offeredSkillId), role: rol(ctx, s.roleId),
    availability: s.availability, status: s.status,
    decision: s.decidedAt ? { comment: s.decisionComment ?? null, decidedAt: s.decidedAt } : null,
    createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
}

export function serializarProyecto(p, ctx, { detalle = false } = {}) {
  const ini = ctx.iniciativas.get(String(p.initiativeId));
  const duenio = persona(ctx, ini.ownerId);
  const proyecto = {
    id: String(p._id), initiative: { id: String(ini._id), title: ini.title },
    name: p.name, objective: p.objective, description: p.description, technologies: p.technologies,
    startDate: p.startDate, estimatedEndDate: p.estimatedEndDate ?? null, status: p.status, repositoryUrl: p.repositoryUrl ?? null,
    owner: { id: duenio.id, fullName: duenio.fullName }, memberCount: integrantes(ini),
    createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
  if (detalle) proyecto.members = ini.members.map((m) => serializarMiembro(m, ctx));
  return proyecto;
}