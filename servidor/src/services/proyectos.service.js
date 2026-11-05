import * as repo from '../repositories/proyectos.repository.js';
import * as iniciativasRepo from '../repositories/iniciativas.repository.js';
import { cargarPropia } from './iniciativas.service.js';
import { contextoIniciativas } from './contexto.service.js';
import { nivelDeAcceso, verificarConversion } from './reglas.js';
import { serializarProyecto } from '../utils/serializadores.js';
import { ErrorApi } from '../utils/ErrorApi.js';

// RN-09 del Avance 2 (RN-17 del documento general) verificada en el servidor.
export async function convertir(idIniciativa, cuerpo, usuario) {
  const ini = await cargarPropia(idIniciativa, usuario);
  const regla = verificarConversion(ini);
  if (regla) throw ErrorApi.conflicto(regla.code, regla.message);
  const proyecto = await repo.crear({ ...cuerpo, initiativeId: ini._id, status: 'planning' }); // índice único: RN-18
  const actualizada = await iniciativasRepo.marcarComoProyecto(ini._id);
  const ctx = await contextoIniciativas([actualizada ?? ini], usuario);
  return serializarProyecto(proyecto, ctx, { detalle: true });
}

export async function listar(q, usuario) {
  const ids = await iniciativasRepo.idsConAccesoCompleto(usuario);
  const pagina = await repo.listarDeIniciativas(ids, q);
  const iniciativas = await iniciativasRepo.buscarVarias(pagina.items.map((p) => p.initiativeId));
  const ctx = await contextoIniciativas(iniciativas, usuario);
  return { ...pagina, items: pagina.items.map((p) => serializarProyecto(p, ctx)) };
}

export async function obtener(id, usuario) {
  const proyecto = await repo.buscarPorId(id);
  const ini = proyecto ? await iniciativasRepo.buscarPorId(proyecto.initiativeId) : null;
  // El proyecto hereda la visibilidad de su iniciativa de origen.
  if (!ini || nivelDeAcceso(ini, usuario) !== 'full') throw ErrorApi.noEncontrado('El proyecto no existe o no tenés acceso.');
  const ctx = await contextoIniciativas([ini], usuario);
  return serializarProyecto(proyecto, ctx, { detalle: true });
}