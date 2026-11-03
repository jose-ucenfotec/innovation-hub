export const TIPOS = {
  idea: { texto: 'Idea', icono: 'bi-lightbulb-fill', color: 'primary' },
  need: { texto: 'Necesidad', icono: 'bi-life-preserver', color: 'success' },
  challenge: { texto: 'Reto', icono: 'bi-flag-fill', color: 'warning' },
};
export const ESTADOS = {
  draft: { texto: 'Borrador', icono: 'bi-pencil-square', color: 'light' },
  published: { texto: 'Publicada', icono: 'bi-broadcast', color: 'light' },
  forming: { texto: 'En formación de equipo', icono: 'bi-people-fill', color: 'light' },
  project: { texto: 'Convertida en proyecto', icono: 'bi-rocket-takeoff-fill', color: 'info' },
  archived: { texto: 'Archivada', icono: 'bi-archive', color: 'secondary' },
};
export const VISIBILIDADES = {
  public: { texto: 'Pública', icono: 'bi-globe2' },
  institutional: { texto: 'Institucional', icono: 'bi-building' },
  restricted: { texto: 'Restringida', icono: 'bi-eye-slash' },
  private: { texto: 'Privada', icono: 'bi-lock-fill' },
};
export const ESTADOS_SOLICITUD = {
  pending: { texto: 'Pendiente', icono: 'bi-hourglass-split', color: 'warning' },
  accepted: { texto: 'Aceptada', icono: 'bi-check-circle-fill', color: 'success' },
  rejected: { texto: 'Rechazada', icono: 'bi-x-circle-fill', color: 'danger' },
  cancelled: { texto: 'Cancelada', icono: 'bi-slash-circle', color: 'secondary' },
};
export const ESTADOS_PROYECTO = {
  planning: { texto: 'Planificación', icono: 'bi-clipboard-check', color: 'info' },
  in_progress: { texto: 'En desarrollo', icono: 'bi-gear-fill', color: 'primary' },
  paused: { texto: 'Pausado', icono: 'bi-pause-circle', color: 'warning' },
  finished: { texto: 'Finalizado', icono: 'bi-flag', color: 'success' },
  archived: { texto: 'Archivado', icono: 'bi-archive', color: 'secondary' },
};
export const NIVELES = { basic: 'básico', intermediate: 'intermedio', advanced: 'avanzado' };
export const TIPOS_MIEMBRO = {
  student: { texto: 'Estudiante', icono: 'bi-mortarboard' },
  teacher: { texto: 'Docente', icono: 'bi-easel' },
  staff: { texto: 'Administrativo', icono: 'bi-briefcase' },
};

// Convierte un mapa en opciones para <select>.
export const opciones = (mapa) => Object.entries(mapa).map(([valor, d]) => ({ valor, texto: d.texto ?? d }));