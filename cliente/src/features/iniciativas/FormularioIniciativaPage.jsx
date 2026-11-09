import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import CampoSelect from '../../components/ui/CampoSelect.jsx';
import SelectorChips from '../../components/ui/SelectorChips.jsx';
import AccionesFormulario from '../../components/ui/AccionesFormulario.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSesion } from '../../context/SesionContext.jsx';
import { listarCategorias, listarCompetencias } from '../../api/catalogos.js';
import { actualizarIniciativa, crearIniciativa, obtenerIniciativa } from '../../api/iniciativas.js';
import { opciones, TIPOS, VISIBILIDADES } from '../../utils/etiquetas.js';
import {
  LIMITES, REGEX_ETIQUETA, cantidad, combinar, formato, longitud, rango, requerido, seleccionValida,
} from '../../utils/validacion.js';

const VACIO = {
  title: '', type: '', summary: '', description: '', problem: '', beneficiaries: '',
  categoryId: '', estimatedMembers: '', visibility: '', requiredSkillIds: [], tags: [],
};
const TEXTOS = ['title', 'summary', 'description', 'problem', 'beneficiaries'];
const texto = (campo) => combinar(requerido, longitud(...LIMITES[campo]));

export default function FormularioIniciativaPage() {
  const { id } = useParams();
  const edicion = Boolean(id);
  const navigate = useNavigate();
  const mostrarToast = useToast();
  const { usuario } = useSesion();
  useTituloPagina(edicion ? 'Editar iniciativa' : 'Publicar iniciativa');

  const carga = useConsulta(
    (signal) => Promise.all([
      listarCategorias(signal),
      listarCompetencias(signal),
      edicion ? obtenerIniciativa(id, signal) : Promise.resolve(null),
    ]),
    [id]
  );
  const [categorias, competencias, original] = carga.datos ?? [[], [], null];
  const minimoIntegrantes = original?.memberCount ?? 1;

  const form = useFormulario(VACIO, {
    title: texto('title'),
    type: seleccionValida(Object.keys(TIPOS)),
    summary: texto('summary'),
    description: texto('description'),
    problem: texto('problem'),
    beneficiaries: texto('beneficiaries'),
    categoryId: seleccionValida(categorias.map((c) => c.id)),
    // Regla entre campos: no menos integrantes que el equipo actual.
    estimatedMembers: combinar(rango(1, 20), (v) => (Number(v) < minimoIntegrantes
      ? `El equipo ya tiene ${minimoIntegrantes} integrantes, incluido vos. No podés indicar menos.` : null)),
    visibility: seleccionValida(Object.keys(VISIBILIDADES)),
    requiredSkillIds: cantidad(1, 8),
    tags: cantidad(0, 5),
  });
  const [procesando, setProcesando] = useState(false);

  // En modo edición, cuando llega la iniciativa se copian sus valores al formulario.
  useEffect(() => {
    if (!original || original.accessLevel !== 'full') return;
    form.reiniciar({
      title: original.title, type: original.type, summary: original.summary, description: original.description,
      problem: original.problem, beneficiaries: original.beneficiaries, categoryId: original.category?.id ?? '',
      estimatedMembers: String(original.estimatedMembers), visibility: original.visibility,
      requiredSkillIds: original.requiredSkills.map((s) => s.id), tags: original.tags,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const cancelar = () => navigate(edicion ? `/iniciativas/${id}` : '/iniciativas');

  async function enviar(e) {
    e.preventDefault();
    if (!form.validarTodo()) return;
    const v = form.valores;
    const cuerpo = {
      ...v,
      ...Object.fromEntries(TEXTOS.map((c) => [c, v[c].trim()])),
      estimatedMembers: Number(v.estimatedMembers),
    };
    setProcesando(true);
    try {
      const guardada = edicion ? await actualizarIniciativa(id, cuerpo) : await crearIniciativa(cuerpo);
      mostrarToast(edicion ? 'Cambios guardados.' : 'Iniciativa publicada.');
      navigate(`/iniciativas/${guardada.id}`);
    } catch (error) {
      if (error.status === 400) form.erroresDelServidor(error.details);
      mostrarToast(error.message, 'danger');
      setProcesando(false);
    }
  }

  let bloqueo = null;
  if (original && original.owner?.id !== usuario.id) bloqueo = 'Solo el propietario puede modificar esta iniciativa.';
  else if (original?.status === 'archived') bloqueo = 'Una iniciativa archivada no se puede modificar.';

  return (
    <div className="container py-4" style={{ maxWidth: '56rem' }}>
      <h1 className="h3 mb-1">{edicion ? 'Editar iniciativa' : 'Publicar iniciativa'}</h1>
      <p className="text-body-secondary mb-4">
        Los campos marcados con <span className="text-danger" aria-hidden="true">*</span>
        <span className="visually-hidden">asterisco</span> son obligatorios.
      </p>

      {carga.cargando && <EstadoCarga texto="Cargando el formulario…" />}
      {carga.error?.status === 404 && <EstadoVacio titulo="No encontramos esa iniciativa" />}
      {carga.error && carga.error.status !== 404 && <EstadoError error={carga.error} onReintentar={carga.recargar} />}
      {bloqueo && <div className="alert alert-warning" role="status">{bloqueo}</div>}

      {carga.datos && !bloqueo && (
        <form className="formulario-tarjeta" noValidate onSubmit={enviar}>
          <div className="row g-3">
            <CampoTexto className="col-12 col-md-8" etiqueta="Título" requerido min={LIMITES.title[0]} max={LIMITES.title[1]} {...form.campo('title')} />
            <CampoSelect className="col-12 col-md-4" etiqueta="Tipo" requerido opciones={opciones(TIPOS)} vacio="Elegí un tipo…" {...form.campo('type')} />
            <CampoTexto className="col-12" etiqueta="Resumen" requerido min={LIMITES.summary[0]} max={LIMITES.summary[1]}
              placeholder="Una frase que explique la iniciativa" {...form.campo('summary')} />
            <CampoTexto className="col-12" etiqueta="Descripción detallada" requerido multilinea filas={4}
              min={LIMITES.description[0]} max={LIMITES.description[1]} {...form.campo('description')} />
            <CampoTexto className="col-12 col-md-6" etiqueta="Problema o situación identificada" requerido multilinea
              min={LIMITES.problem[0]} max={LIMITES.problem[1]} {...form.campo('problem')} />
            <CampoTexto className="col-12 col-md-6" etiqueta="Población o usuarios beneficiados" requerido multilinea
              min={LIMITES.beneficiaries[0]} max={LIMITES.beneficiaries[1]} {...form.campo('beneficiaries')} />
            <CampoSelect className="col-12 col-md-6" etiqueta="Categoría" requerido vacio="Elegí una categoría…"
              opciones={categorias.map((c) => ({ valor: c.id, texto: c.name }))} {...form.campo('categoryId')} />
            <CampoTexto className="col-6 col-md-3" etiqueta="Integrantes estimados" requerido tipo="number" inputMode="numeric"
              placeholder="1 a 20" ayuda={edicion ? `Mínimo ${minimoIntegrantes} (equipo actual)` : 'Incluyéndote'} {...form.campo('estimatedMembers')} />
            {/* la visibilidad empieza vacía y es obligatoria. */}
            <CampoSelect className="col-6 col-md-3" etiqueta="Visibilidad" requerido vacio="Elegí…"
              opciones={opciones(VISIBILIDADES)} {...form.campo('visibility')} />
            <SelectorChips
              className="col-12" id="requiredSkillIds" etiqueta="Competencias necesarias" requerido max={8} confirmarAlQuitar
              opciones={competencias.map((c) => ({ valor: c.id, texto: c.name }))}
              valores={form.valores.requiredSkillIds} error={form.errores.requiredSkillIds}
              onChange={(lista) => form.cambiar('requiredSkillIds', lista)}
              ayuda="Elegí una competencia y presioná Agregar"
            />
            <SelectorChips
              className="col-12" id="tags" etiqueta="Etiquetas" libre max={5} placeholder="ciberseguridad"
              valores={form.valores.tags} error={form.errores.tags}
              onChange={(lista) => form.cambiar('tags', lista)}
              validarNuevo={formato(REGEX_ETIQUETA, 'Usá letras, números, espacios o guiones (2 a 30 caracteres).')}
              ayuda="Escribí una etiqueta y presioná Enter, coma o Agregar"
            />
          </div>
          <AccionesFormulario textoGuardar={edicion ? 'Guardar cambios' : 'Publicar iniciativa'} procesando={procesando} onCancelar={cancelar} />
        </form>
      )}
    </div>
  );
}