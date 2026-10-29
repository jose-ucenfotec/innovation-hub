import { nivelDeAcceso, esPropietario, integrantes, espaciosDisponibles } from './reglas.js';

export const nombreCompleto = (u) => [u.firstName, u.lastName, u.secondLastName].filter(Boolean).join(' ');
const porId = (lista, id) => lista.find((x) => x.id === id);
const resumenUsuario = (db, id) => {
  const u = porId(db.users, id);
  return { id, fullName: u ? nombreCompleto(u) : 'Usuario no disponible', career: u?.career ?? '' };
};
const competencia = (db, id) => ({ id, name: porId(db.skills, id)?.name ?? id });
const rol = (db, id) => ({ id, name: porId(db.roles, id)?.name ?? id });

export function serializarUsuarioPublico(u, db) {
  return {
    id: u.id, firstName: u.firstName, lastName: u.lastName, secondLastName: u.secondLastName,
    fullName: nombreCompleto(u), memberType: u.memberType, career: u.career, bio: u.bio,
    skills: u.skills.map((s) => ({ skillId: s.skillId, name: competencia(db, s.skillId).name, level: s.level })),
    interests: u.interests, availability: u.availability, portfolioUrl: u.portfolioUrl,
  };
}

export const serializarUsuarioPropio = (u, db) => ({
  ...serializarUsuarioPublico(u, db), email: u.email, status: u.status, createdAt: u.createdAt, updatedAt: u.updatedAt,
});

export function serializarIniciativa(ini, db, usuario, { detalle = false } = {}) {
  const categoria = porId(db.categories, ini.categoryId);
  const base = {
    id: ini.id,
    accessLevel: nivelDeAcceso(ini, usuario) === 'full' ? 'full' : 'summary',
    title: ini.title, type: ini.type, summary: ini.summary,
    category: categoria ? { id: categoria.id, name: categoria.name, icon: categoria.icon } : null,
    requiredSkills: ini.requiredSkillIds.map((id) => competencia(db, id)),
    visibility: ini.visibility,
  };
  if (base.accessLevel !== 'full') return base;

  const proyecto = db.projects.find((p) => p.initiativeId === ini.id);
  const propietario = resumenUsuario(db, ini.ownerId);
  const completo = {
    ...base,
    tags: ini.tags, status: ini.status, estimatedMembers: ini.estimatedMembers,
    memberCount: integrantes(ini), availableSpots: espaciosDisponibles(ini),
    owner: { id: propietario.id, fullName: propietario.fullName },
    projectId: proyecto?.id ?? null, createdAt: ini.createdAt, updatedAt: ini.updatedAt,
  };
  if (detalle) {
    completo.description = ini.description;
    completo.problem = ini.problem;
    completo.beneficiaries = ini.beneficiaries;
    completo.members = ini.members.map((m) => {
      const u = resumenUsuario(db, m.userId);
      return { userId: m.userId, fullName: u.fullName, career: u.career, role: rol(db, m.roleId), joinedAt: m.joinedAt };
    });
  }
  if (esPropietario(ini, usuario)) {
    completo.relations = {
      members: ini.members.length,
      requests: db.requests.filter((r) => r.initiativeId === ini.id).length,
      hasProject: !!proyecto,
    };
  }
  return completo;
}

export function serializarSolicitud(r, db) {
  const ini = porId(db.initiatives, r.initiativeId);
  const solicitante = porId(db.users, r.userId);
  return {
    id: r.id,
    initiative: { id: r.initiativeId, title: ini?.title ?? 'Iniciativa eliminada' },
    applicant: solicitante
      ? { id: solicitante.id, fullName: nombreCompleto(solicitante), career: solicitante.career,
          skills: serializarUsuarioPublico(solicitante, db).skills }
      : { id: r.userId, fullName: 'Usuario no disponible', career: '', skills: [] },
    message: r.message, offeredSkill: competencia(db, r.offeredSkillId), role: rol(db, r.roleId),
    availability: r.availability, status: r.status,
    decision: r.decidedAt ? { comment: r.decisionComment, decidedAt: r.decidedAt } : null,
    createdAt: r.createdAt, updatedAt: r.updatedAt,
  };
}

export function serializarProyecto(p, db, { detalle = false } = {}) {
  const ini = porId(db.initiatives, p.initiativeId);
  const propietario = resumenUsuario(db, ini.ownerId);
  const proyecto = {
    id: p.id, initiative: { id: ini.id, title: ini.title },
    name: p.name, objective: p.objective, description: p.description, technologies: p.technologies,
    startDate: p.startDate, estimatedEndDate: p.estimatedEndDate, status: p.status, repositoryUrl: p.repositoryUrl,
    owner: { id: propietario.id, fullName: propietario.fullName }, memberCount: integrantes(ini),
    createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
  if (detalle) {
    proyecto.members = ini.members.map((m) => {
      const u = resumenUsuario(db, m.userId);
      return { userId: m.userId, fullName: u.fullName, career: u.career, role: rol(db, m.roleId), joinedAt: m.joinedAt };
    });
  }
  return proyecto;
}