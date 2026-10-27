import { useEffect } from 'react';

// Actualiza el <title> del documento
export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Innovation Hub` : 'Innovation Hub';
  }, [titulo]);
}