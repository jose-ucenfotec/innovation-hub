import { createContext, useContext, useState } from 'react';
import { useConsulta } from '../hooks/useConsulta.js';
import { listarUsuariosDev } from '../api/dev.js';
import { obtenerUsuarioDev, fijarUsuarioDev } from '../api/sesion.js';
import { obtenerPerfilPropio } from '../api/usuarios.js';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuarioId, setUsuarioId] = useState(obtenerUsuarioDev);
  const usuarios = useConsulta((signal) => listarUsuariosDev(signal), []);
  const perfil = useConsulta(
    (signal) => (usuarioId ? obtenerPerfilPropio(signal) : Promise.resolve(null)),
    [usuarioId]
  );

  function cambiarUsuario(id) {
    fijarUsuarioDev(id);
    setUsuarioId(id);
  }

  const valor = {
    usuario: perfil.datos,
    cargandoSesion: perfil.cargando,
    recargarUsuario: perfil.recargar,
    usuarioIdDev: usuarioId,
    usuariosDev: usuarios.datos ?? [],
    cambiarUsuario,
  };
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export const useSesion = () => useContext(SesionContext);