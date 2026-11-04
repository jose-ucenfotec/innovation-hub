import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import CampoSelect from '../../components/ui/CampoSelect.jsx';
import AccionesFormulario from '../../components/ui/AccionesFormulario.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EstadoVacio from '../../components/ui/EstadoVacio.jsx';
import Chip from '../../components/ui/Chip.jsx';
import { BadgeTipo } from '../../components/ui/Badges.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { obtenerIniciativa, crearSolicitud } from '../../api/iniciativas.js';
import { obtenerSolicitud, actualizarSolicitud } from '../../api/solicitudes.js';
import { listarRoles } from '../../api/catalogos.js';
import { NIVELES } from '../../utils/etiquetas.js';
import { LIMITES, REGEX_DISPONIBILIDAD, combinar, formato, longitud, requerido, seleccionValida } from '../../utils/validacion.js';

export default function FormularioSolicitudPage() {
  const { id, solicitudId } = useParams();
  const edicion = Boolean(solicitudId);
  const navigate = useNavigate();
  const mostrarToast = useToast();
  const { usuario } = useSesion();
  useTituloPagina(edicion ? 'Modificar solicitud' : 'Solicitar participación');

  const carga = useConsulta(async (signal) => {
    const solicitud = edicion ? await obtenerSolicitud(solicitudId, signal) : null;
    const [ini, roles] = await Promise.all([obtenerIniciativa(edicion ? solicitud.initiative.id : id, signal), listarRoles(signal)]);
    return { solicitud, ini, roles };
  }, [id, solicitudId]);
  const { solicitud, ini, roles } = carga.datos ?? { roles: [] };

  // Solo las competencias que la iniciativa requiere y que el usuario tiene.
  const ofrecibles = ini ? usuario.skills.filter((s) => ini.requiredSkills.some((r) => r.id === s.skillId)) : [];

  const form = useFormulario(
    { message: '', offeredSkillId: '', roleId: '', availability: '' },
    {
      message: combinar(requerido, longitud(...LIMITES.message)),
      offeredSkillId: seleccionValida(ofrecibles.map((s) => s.skillId)),
      roleId: seleccionValida(roles.map((r) => r.id)),
      availability: combinar(requerido, formato(REGEX_DISPONIBILIDAD, 'Usá el formato "N h/semana", por ejemplo 4 h/semana.')),
    }
  );
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!carga.datos) return;
    form.reiniciar(solicitud
      ? { message: solicitud.message, offeredSkillId: solicitud.offeredSkill.id, roleId: solicitud.role.id, availability: solicitud.availability }
      : { message: '', offeredSkillId: '', roleId: '', availability: usuario.availability?.hoursPerWeek ? `${usuario.availability.hoursPerWeek} h/semana` : '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carga.datos]);

  if (carga.cargando) return <div className="container py-4"><EstadoCarga /></div>;
  if (carga.error) return <div className="container py-4"><EstadoError error={carga.error} onReintentar={carga.recargar} /></div>;

  const volver = () => navigate(`/iniciativas/${ini.id}`); // Cancelar vuelve a la iniciativa, no al catálogo
  const completa = ini.accessLevel === 'full';
  let bloqueo = null;
  if (edicion && solicitud.status !== 'pending') bloqueo = 'Solo las solicitudes pendientes pueden modificarse.';
  else if (!edicion && completa && ini.owner.id === usuario.id) bloqueo = 'No podés solicitar participación en tu propia iniciativa.';
  else if (!edicion && completa && ini.members.some((m) => m.userId === usuario.id)) bloqueo = 'Ya formás parte del equipo de esta iniciativa.';
  else if (!edicion && completa && !['published', 'forming'].includes(ini.status)) bloqueo = 'Esta iniciativa ya no recibe solicitudes.';
  else if (!edicion && completa && ini.availableSpots === 0) bloqueo = 'La iniciativa ya completó los espacios previstos.';

  async function enviar(e) {
    e.preventDefault();
    if (!form.validarTodo()) return;
    const cuerpo = { ...form.valores, message: form.valores.message.trim(), availability: form.valores.availability.trim() };
    setProcesando(true);
    try {
      if (edicion) {
        await actualizarSolicitud(solicitudId, cuerpo);
        mostrarToast('Solicitud actualizada.');
        navigate('/solicitudes');
      } else {
        await crearSolicitud(ini.id, cuerpo);
        mostrarToast('Solicitud enviada. Queda pendiente hasta que el propietario la resuelva.');
        volver();
      }
    } catch (error) {
      if (error.status === 400) form.erroresDelServidor(error.details);
      mostrarToast(error.message, 'danger');
      setProcesando(false);
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">{edicion ? 'Modificar solicitud' : 'Solicitar participación'}</h1>
      <div className="row g-4">
        <div className="col-lg-7">
          {bloqueo && <div className="alert alert-warning" role="status">{bloqueo} <Link to={`/iniciativas/${ini.id}`}>Volver a la iniciativa</Link></div>}
          {!bloqueo && ofrecibles.length === 0 && (
            <EstadoVacio titulo="No tenés competencias que esta iniciativa requiera" accion={<Link className="btn btn-outline-primary btn-sm" to="/perfil">Ir a mi perfil</Link>}>
              Agregá a tu perfil alguna de las competencias que se buscan para poder postularte.
            </EstadoVacio>
          )}
          {!bloqueo && ofrecibles.length > 0 && (
            <form className="formulario-tarjeta" noValidate onSubmit={enviar}>
              <CampoTexto etiqueta="Mensaje de presentación" requerido multilinea filas={4} min={LIMITES.message[0]} max={LIMITES.message[1]}
                placeholder="Contá por qué querés participar y qué podés aportar." {...form.campo('message')} />
              <div className="row g-3">
                <CampoSelect className="col-md-6" etiqueta="Competencia principal que aportás" requerido vacio="Elegí una competencia…"
                  ayuda="Solo las que la iniciativa requiere y tenés en tu perfil."
                  opciones={ofrecibles.map((s) => ({ valor: s.skillId, texto: `${s.name} · ${NIVELES[s.level]}` }))} {...form.campo('offeredSkillId')} />
                <CampoSelect className="col-md-6" etiqueta="Rol que querés desempeñar" requerido vacio="Elegí un rol…"
                  opciones={roles.map((r) => ({ valor: r.id, texto: r.name }))} {...form.campo('roleId')} />
              </div>
              <CampoTexto etiqueta="Disponibilidad" requerido placeholder="4 h/semana" ayuda='Número de horas seguido de "h/semana".' {...form.campo('availability')} />
              <AccionesFormulario textoGuardar={edicion ? 'Guardar cambios' : 'Enviar solicitud'} procesando={procesando} onCancelar={volver} />
            </form>
          )}
        </div>
        <aside className="col-lg-5">
          <div className="card tarjeta-lateral">
            <div className="card-body">
              <h2 className="seccion-titulo">Iniciativa</h2>
              <p className="fw-semibold mb-2"><Link to={`/iniciativas/${ini.id}`}>{ini.title}</Link></p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <BadgeTipo tipo={ini.type} />
                {completa && <Chip icono="bi-person-plus">{ini.availableSpots} espacios libres</Chip>}
              </div>
              <h2 className="seccion-titulo">Buscan</h2>
              <ul className="lista-chips mb-3">
                {ini.requiredSkills.map((s) => <li key={s.id}><Chip icono="bi-stars">{s.name}</Chip></li>)}
              </ul>
              <p className="small text-body-secondary mb-0">
                <i className="bi bi-person" aria-hidden="true"></i> Tu solicitud llegará a {completa ? <strong>{ini.owner.fullName}</strong> : 'el propietario'}.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}