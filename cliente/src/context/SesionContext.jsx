import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as apiAuth from '../api/auth.js';
import { obtenerPerfilPropio } from '../api/usuarios.js';
import { borrarToken, guardarToken, obtenerToken } from '../api/sesion.js';
import { useToast } from './ToastContext.jsx';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const mostrarToast = useToast();
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(obtenerToken()));

  // Al abrir la aplicación con un token guardado, se recupera el perfil.
  useEffect(() => {
    if (!obtenerToken()) return undefined;
    const control = new AbortController();
    obtenerPerfilPropio(control.signal)
      .then(setUsuario)
      .catch((error) => { if (error.name !== 'AbortError') { borrarToken(); setUsuario(null); } })
      .finally(() => { if (!control.signal.aborted) setCargandoSesion(false); });
    return () => control.abort();
  }, []);

  // cliente.js emite este evento cuando el servidor responde 401 a una petición con token.
  useEffect(() => {
    const alExpirar = () => {
      setUsuario(null);
      mostrarToast('Tu sesión terminó. Iniciá sesión de nuevo.', 'warning');
    };
    window.addEventListener('ih:sesion-expirada', alExpirar);
    return () => window.removeEventListener('ih:sesion-expirada', alExpirar);
  }, [mostrarToast]);

  const iniciarSesion = useCallback(async (credenciales) => {
    const respuesta = await apiAuth.iniciarSesion(credenciales);
    guardarToken(respuesta.token);
    setUsuario(respuesta.user);
    return respuesta.user;
  }, []);

  const registrar = useCallback(async (datos) => {
    await apiAuth.registrar(datos);
    return iniciarSesion({ email: datos.email, password: datos.password });
  }, [iniciarSesion]);

  const cerrarSesion = useCallback(async () => {
    try {
      await apiAuth.cerrarSesion(); // el servidor revoca el token
    } finally {
      borrarToken();
      setUsuario(null);
    }
  }, []);

  const recargarUsuario = useCallback(() => obtenerPerfilPropio().then(setUsuario), []);

  return (
    <SesionContext.Provider value={{ usuario, cargandoSesion, iniciarSesion, registrar, cerrarSesion, recargarUsuario }}>
      {children}
    </SesionContext.Provider>
  );
}

export const useSesion = () => useContext(SesionContext);