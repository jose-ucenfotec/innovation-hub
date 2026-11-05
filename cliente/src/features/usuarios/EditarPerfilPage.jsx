import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import SelectorChips from '../../components/ui/SelectorChips.jsx';
import AccionesFormulario from '../../components/ui/AccionesFormulario.jsx';
import EstadoCarga from '../../components/ui/EstadoCarga.jsx';
import EstadoError from '../../components/ui/EstadoError.jsx';
import EditorCompetencias from './EditorCompetencias.jsx';
import { useConsulta } from '../../hooks/useConsulta.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { actualizarPerfil, obtenerPerfilPropio } from '../../api/usuarios.js';
import { listarCompetencias } from '../../api/catalogos.js';
import { LIMITES, REGEX_URL, cantidad, combinar, formato, longitud, opcional, rango, requerido } from '../../utils/validacion.js';

const nombre = combinar(requerido, longitud(2, 60));

export default function EditarPerfilPage() {
  useTituloPagina('Editar perfil');
  const navigate = useNavigate();
  const mostrarToast = useToast();
  const { recargarUsuario } = useSesion();
  const carga = useConsulta((signal) => Promise.all([obtenerPerfilPropio(signal), listarCompetencias(signal)]), []);
  const [perfil, catalogo] = carga.datos ?? [null, []];
  const [procesando, setProcesando] = useState(false);

  const form = useFormulario(
    { firstName: '', lastName: '', secondLastName: '', career: '', bio: '', skills: [], interests: [], hoursPerWeek: '0', detail: '', portfolioUrl: '' },
    {
      firstName: nombre, lastName: nombre, secondLastName: opcional(longitud(2, 60)), career: nombre,
      bio: longitud(0, LIMITES.bio[1]),
      skills: cantidad(0, 15), interests: cantidad(0, 10),
      hoursPerWeek: rango(0, 40), detail: longitud(0, 100),
      portfolioUrl: opcional(formato(REGEX_URL, 'Ingresá una URL que empiece con http:// o https://.')),
    }
  );

  useEffect(() => {
    if (!perfil) return;
    form.reiniciar({
      firstName: perfil.firstName, lastName: perfil.lastName, secondLastName: perfil.secondLastName ?? '', career: perfil.career,
      bio: perfil.bio, skills: perfil.skills.map(({ skillId, level }) => ({ skillId, level })), interests: perfil.interests,
      hoursPerWeek: String(perfil.availability.hoursPerWeek), detail: perfil.availability.detail, portfolioUrl: perfil.portfolioUrl ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil]);

  async function enviar(e) {
    e.preventDefault();
    if (!form.validarTodo()) return;
    const v = form.valores;
    setProcesando(true);
    try {
      await actualizarPerfil({
        firstName: v.firstName.trim(), lastName: v.lastName.trim(), secondLastName: v.secondLastName.trim() || null,
        career: v.career.trim(), bio: v.bio.trim(), skills: v.skills, interests: v.interests,
        availability: { hoursPerWeek: Number(v.hoursPerWeek), detail: v.detail.trim() },
        portfolioUrl: v.portfolioUrl.trim() || null,
      });
      await recargarUsuario();
      mostrarToast('Perfil actualizado.');
      navigate('/perfil');
    } catch (error) {
      if (error.status === 400) form.erroresDelServidor(error.details);
      mostrarToast(error.message, 'danger');
      setProcesando(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '48rem' }}>
      <h1 className="h3 mb-4">Editar perfil</h1>
      {carga.cargando && <EstadoCarga texto="Cargando tu perfil…" />}
      {carga.error && <EstadoError error={carga.error} onReintentar={carga.recargar} />}
      {perfil && (
        <form className="formulario-tarjeta" noValidate onSubmit={enviar}>
          <div className="row g-3">
            <CampoTexto className="col-md-4" etiqueta="Nombre" requerido {...form.campo('firstName')} />
            <CampoTexto className="col-md-4" etiqueta="Primer apellido" requerido {...form.campo('lastName')} />
            <CampoTexto className="col-md-4" etiqueta="Segundo apellido" ayuda="Opcional" {...form.campo('secondLastName')} />
            {/* El correo identifica la cuenta: se muestra pero no se edita. */}
            <CampoTexto className="col-md-6" id="email" etiqueta="Correo" valor={perfil.email} onChange={() => {}} readOnly ayuda="No se puede modificar desde el perfil." />
            <CampoTexto className="col-md-6" etiqueta="Carrera o área profesional" requerido {...form.campo('career')} />
            <CampoTexto className="col-12" etiqueta="Descripción personal" multilinea max={LIMITES.bio[1]} {...form.campo('bio')} />
          </div>
          <EditorCompetencias valores={form.valores.skills} catalogo={catalogo} error={form.errores.skills} onChange={(lista) => form.cambiar('skills', lista)} />
          <SelectorChips id="interests" etiqueta="Intereses" libre max={10} placeholder="comunidad" valores={form.valores.interests}
            error={form.errores.interests} onChange={(lista) => form.cambiar('interests', lista)} ayuda="Escribí un interés y presioná Enter"
            validarNuevo={(v) => (v.length < 2 || v.length > 30 ? 'Entre 2 y 30 caracteres.' : null)} />
          <div className="row g-3">
            <CampoTexto className="col-sm-4" etiqueta="Horas por semana" tipo="number" inputMode="numeric" ayuda="0 si por ahora no estás disponible" {...form.campo('hoursPerWeek')} />
            <CampoTexto className="col-sm-8" etiqueta="Detalle de disponibilidad" max={100} placeholder="tardes y fines de semana" {...form.campo('detail')} />
          </div>
          <CampoTexto etiqueta="Portafolio" tipo="url" placeholder="https://github.com/usuario" ayuda="Opcional" {...form.campo('portfolioUrl')} />
          <AccionesFormulario textoGuardar="Guardar perfil" procesando={procesando} onCancelar={() => navigate('/perfil')} />
        </form>
      )}
    </div>
  );
}