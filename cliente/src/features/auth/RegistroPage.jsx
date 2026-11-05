import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import CampoSelect from '../../components/ui/CampoSelect.jsx';
import CampoCasilla from '../../components/ui/CampoCasilla.jsx';
import AccionesFormulario from '../../components/ui/AccionesFormulario.jsx';
import { useFormulario } from '../../hooks/useFormulario.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { opciones, TIPOS_MIEMBRO } from '../../utils/etiquetas.js';
import { REGEX_CORREO, combinar, formato, longitud, opcional, requerido, seleccionValida } from '../../utils/validacion.js';

const nombre = combinar(requerido, longitud(2, 60));

export default function RegistroPage() {
  useTituloPagina('Crear cuenta');
  const { usuario, registrar } = useSesion();
  const navigate = useNavigate();
  const mostrarToast = useToast();
  const [procesando, setProcesando] = useState(false);
  const form = useFormulario(
    { firstName: '', lastName: '', secondLastName: '', email: '', password: '', confirmPassword: '', memberType: '', career: '', acceptTerms: false },
    {
      firstName: nombre,
      lastName: nombre,
      secondLastName: opcional(longitud(2, 60)),
      email: combinar(requerido, formato(REGEX_CORREO, 'Ingresá un correo válido.')),
      password: combinar(requerido, longitud(8, 72), formato(/[A-Za-zÁÉÍÓÚáéíóúÑñ]/, 'Debe incluir al menos una letra.'), formato(/\d/, 'Debe incluir al menos un número.')),
      // Regla entre campos: la confirmación debe coincidir.
      confirmPassword: (v, todos) => (!v ? 'Confirmá la contraseña.' : v !== todos.password ? 'Las contraseñas no coinciden.' : null),
      memberType: seleccionValida(Object.keys(TIPOS_MIEMBRO)),
      career: nombre,
      acceptTerms: (v) => (v ? null : 'Debés aceptar los términos de uso.'),
    }
  );

  // Con sesión abierta no tiene sentido registrarse. Va al mismo destino que tras registrarse,
  // porque el Layout vuelve a montar esta página cuando cambia el usuario.
  if (usuario) return <Navigate to="/perfil/editar" replace />;

  async function enviar(e) {
    e.preventDefault();
    if (!form.validarTodo()) return;
    const v = form.valores;
    setProcesando(true);
    try {
      await registrar({
        firstName: v.firstName.trim(), lastName: v.lastName.trim(), secondLastName: v.secondLastName.trim() || null,
        email: v.email.trim(), password: v.password, confirmPassword: v.confirmPassword,
        memberType: v.memberType, career: v.career.trim(), acceptTerms: v.acceptTerms,
      });
      mostrarToast('Cuenta creada. Completá tu perfil con tus competencias.');
      navigate('/perfil/editar', { replace: true });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') form.erroresDelServidor([{ field: 'email', message: error.message }]);
      else if (error.status === 400) form.erroresDelServidor(error.details);
      mostrarToast(error.message, 'danger');
      setProcesando(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '44rem' }}>
      <h1 className="h3 mb-1">Crear cuenta</h1>
      <p className="text-body-secondary mb-4">Los campos con <span className="text-danger" aria-hidden="true">*</span><span className="visually-hidden">asterisco</span> son obligatorios.</p>
      <form className="formulario-tarjeta" noValidate onSubmit={enviar}>
        <div className="row g-3">
          <CampoTexto className="col-md-4" etiqueta="Nombre" requerido autoComplete="given-name" {...form.campo('firstName')} />
          <CampoTexto className="col-md-4" etiqueta="Primer apellido" requerido autoComplete="family-name" {...form.campo('lastName')} />
          <CampoTexto className="col-md-4" etiqueta="Segundo apellido" ayuda="Opcional" {...form.campo('secondLastName')} />
          <CampoTexto className="col-12" etiqueta="Correo" requerido tipo="email" autoComplete="email" ayuda="Será tu identificador; no se podrá cambiar." {...form.campo('email')} />
          <CampoTexto className="col-md-6" etiqueta="Contraseña" requerido tipo="password" autoComplete="new-password" min={8} max={72} ayuda="Al menos una letra y un número." {...form.campo('password')} />
          <CampoTexto className="col-md-6" etiqueta="Confirmar contraseña" requerido tipo="password" autoComplete="new-password" {...form.campo('confirmPassword')} />
          <CampoSelect className="col-md-6" etiqueta="Tipo de miembro" requerido vacio="Elegí…" opciones={opciones(TIPOS_MIEMBRO)} {...form.campo('memberType')} />
          <CampoTexto className="col-md-6" etiqueta="Carrera o área profesional" requerido {...form.campo('career')} />
          <CampoCasilla className="col-12" etiqueta="Acepto los términos de uso de Innovation Hub" {...form.campo('acceptTerms')} />
        </div>
        <AccionesFormulario textoGuardar="Crear cuenta" procesando={procesando} onCancelar={() => navigate('/')} />
        <p className="small mt-3 mb-0">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </form>
    </div>
  );
}