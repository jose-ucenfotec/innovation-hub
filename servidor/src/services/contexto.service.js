import { mapasCatalogo } from '../repositories/catalogos.repository.js';
import * as usuariosRepo from '../repositories/usuarios.repository.js';
import * as solicitudesRepo from '../repositories/solicitudes.repository.js';
import * as proyectosRepo from '../repositories/proyectos.repository.js';
import { esPropietario } from './reglas.js';

export async function contextoIniciativas(iniciativas, usuario, personasExtra = []) {
  const ids = iniciativas.map((i) => i._id);
  const personas = new Set([...personasExtra.map(String), ...iniciativas.flatMap((i) => [String(i.ownerId), ...i.members.map((m) => String(m.userId))])]);
  const propias = iniciativas.filter((i) => esPropietario(i, usuario)).map((i) => i._id);
  const [catalogo, usuarios, proyectos, solicitudes] = await Promise.all([
    mapasCatalogo(),
    usuariosRepo.mapaPorIds([...personas]),
    proyectosRepo.mapaPorIniciativas(ids),
    solicitudesRepo.contarPorIniciativas(propias),
  ]);
  return { ...catalogo, usuarios, proyectos, solicitudes, iniciativas: new Map(iniciativas.map((i) => [String(i._id), i])) };
}