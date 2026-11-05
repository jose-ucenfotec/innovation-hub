import { useEffect, useState } from 'react';

// Devuelve el valor recién cuando dejó de cambiar durante `ms` milisegundos.
export function useValorDiferido(valor, ms = 350) {
  const [diferido, setDiferido] = useState(valor);
  useEffect(() => {
    const temporizador = setTimeout(() => setDiferido(valor), ms);
    return () => clearTimeout(temporizador);
  }, [valor, ms]);
  return diferido;
}