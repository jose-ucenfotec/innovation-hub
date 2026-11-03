import { useCallback, useEffect, useState } from 'react';

export function useConsulta(consultar, deps) {
  const [estado, setEstado] = useState({ cargando: true, error: null, datos: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    consultar(control.signal)
      .then((datos) => { if (!control.signal.aborted) setEstado({ cargando: false, error: null, datos }); })
      .catch((error) => { if (!control.signal.aborted) setEstado({ cargando: false, error, datos: null }); });
    // se cancela la petición anterior y su respuesta se ignora.
    return () => control.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}