import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import SelectorChips from '../../components/ui/SelectorChips.jsx';
import AccionesFormulario from '../../components/ui/AccionesFormulario.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { convertirEnProyecto, obtenerIniciativa } from '../../api/iniciativas.js';
import { LIMITES, REGEX_GITHUB, cantidad, combinar, formato, longitud, opcional, requerido } from '../../utils/validacion.js';

export default function ConvertirProyectoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mostrarToast = useToast();
  const { usuario } = useSesion();
  useTituloPagina('Convertir en proyecto');
  const { cargando, error, datos: ini, recargar } = useConsulta((signal) => obtenerIniciativa(id, signal), [id]);
  const [procesando, setProcesando] = useState(false);

  const form = useFormulario(
    { name: '', objective: '', description: '', technologies: [], startDate: '', estimatedEndDate: '', repositoryUrl: '' },
    {
      name: combinar(requerido, longitud(...LIMITES.name)),
      objective: combinar(requerido, longitud(...LIMITES.objective)),
      description: combinar(requerido, longitud(...LIMITES.description)),
      technologies: cantidad(0, 10),
      startDate: requerido,
      estimatedEndDate: opcional((v, todos) => (todos.startDate && v < todos.startDate ? 'Debe ser igual o posterior a la fecha de inicio.' : null)),
      repositoryUrl: opcional(formato(REGEX_GITHUB, 'Usá el formato https://github.com/usuario/repositorio.')),
    }
  );

  useEffect(() => {
    if (ini?.accessLevel === 'full') {
      form.reiniciar({ ...form.valores, name: ini.title, description: ini.description, startDate: new Date().toISOString().slice(0, 10) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ini]);

  if (cargando) return <div className="container py-4"><EstadoCarga /></div>;
  if (error) return <div className="container py-4"><EstadoError error={error} onReintentar={recargar} /></div>;

  let bloqueo = null;
  if (ini.accessLevel !== 'full' || ini.owner.id !== usuario.id) bloqueo = 'Solo el propietario puede convertir la iniciativa en proyecto.';
  else if (ini.status === 'project') bloqueo = 'Esta iniciativa ya se convirtió en proyecto.';
  else if (ini.members.length === 0) bloqueo = 'Se necesita al menos un integrante además del propietario (RN-17).';

  async function enviar(e) {
    e.preventDefault();
    if (!form.validarTodo()) return;
    const v = form.valores;
    setProcesando(true);
    try {
      const proyecto = await convertirEnProyecto(id, {
        ...v, name: v.name.trim(), objective: v.objective.trim(), description: v.description.trim(),
        estimatedEndDate: v.estimatedEndDate || null, repositoryUrl: v.repositoryUrl.trim() || null,
      });
      mostrarToast('La iniciativa ahora es un proyecto.', 'info');
      navigate(`/proyectos/${proyecto.id}`);
    } catch (err) {
      if (err.status === 400) form.erroresDelServidor(err.details);
      mostrarToast(err.message, 'danger');
      setProcesando(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '48rem' }}>
      <h1 className="h3 mb-1">Convertir en proyecto</h1>
      <p className="text-body-secondary mb-4">Iniciativa de origen: <strong>{ini.title}</strong></p>
      {bloqueo ? <div className="alert alert-warning" role="status">{bloqueo}</div> : (
        <form className="formulario-tarjeta" noValidate onSubmit={enviar}>
          <CampoTexto etiqueta="Nombre del proyecto" requerido min={LIMITES.name[0]} max={LIMITES.name[1]} {...form.campo('name')} />
          <CampoTexto etiqueta="Objetivo" requerido multilinea filas={2} min={LIMITES.objective[0]} max={LIMITES.objective[1]} {...form.campo('objective')} />
          <CampoTexto etiqueta="Descripción" requerido multilinea filas={4} min={LIMITES.description[0]} max={LIMITES.description[1]} {...form.campo('description')} />
          <SelectorChips id="technologies" etiqueta="Tecnologías previstas" libre max={10} placeholder="React"
            valores={form.valores.technologies} error={form.errores.technologies}
            onChange={(lista) => form.cambiar('technologies', lista)} ayuda="Escribí una tecnología y presioná Enter" />
          <div className="row g-3">
            <CampoTexto className="col-sm-6" etiqueta="Fecha de inicio" requerido tipo="date" {...form.campo('startDate')} />
            <CampoTexto className="col-sm-6" etiqueta="Fecha estimada de finalización" tipo="date" ayuda="Opcional" {...form.campo('estimatedEndDate')} />
          </div>
          <CampoTexto etiqueta="Repositorio de GitHub" tipo="url" placeholder="https://github.com/usuario/repositorio" ayuda="Opcional, debe ser público" {...form.campo('repositoryUrl')} />
          <AccionesFormulario textoGuardar="Crear proyecto" procesando={procesando} onCancelar={() => navigate(`/iniciativas/${id}`)} />
        </form>
      )}
    </div>
  );
}