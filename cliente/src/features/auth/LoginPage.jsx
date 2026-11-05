import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import CampoTexto from '../../components/ui/CampoTexto.jsx';
import { useFormulario } from '../../hooks/useFormulario.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { REGEX_CORREO, combinar, formato, requerido } from '../../utils/validacion.js';

export default function LoginPage() {
  useTituloPagina('Iniciar sesión');
  const { usuario, iniciarSesion } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde?.pathname ?? '/iniciativas';
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const form = useFormulario(
    { email: '', password: '' },
    { email: combinar(requerido, formato(REGEX_CORREO, 'Ingresá un correo válido.')), password: requerido }
  );

  if (usuario) return <Navigate to={destino} replace />;

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral(null);
    if (!form.validarTodo()) return;
    setProcesando(true);
    try {
      await iniciarSesion({ email: form.valores.email.trim(), password: form.valores.password });
      navigate(destino, { replace: true });
    } catch (error) {
      setErrorGeneral(error.message);
      setProcesando(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '28rem' }}>
      <h1 className="h3 mb-4 text-center">Iniciar sesión</h1>
      <form className="formulario-tarjeta" noValidate onSubmit={enviar}>
        {errorGeneral && <div className="alert alert-danger d-flex gap-2" role="alert"><i className="bi bi-x-circle-fill" aria-hidden="true"></i> {errorGeneral}</div>}
        <CampoTexto etiqueta="Correo" requerido tipo="email" autoComplete="email" {...form.campo('email')} />
        <CampoTexto etiqueta="Contraseña" requerido tipo="password" autoComplete="current-password" {...form.campo('password')} />
        <button type="submit" className="btn btn-primary w-100" disabled={procesando}>
          {procesando && <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>} Entrar
        </button>
        <p className="small text-center mt-3 mb-0">¿No tenés cuenta? <Link to="/registro">Creala acá</Link></p>
      </form>
    </div>
  );
}