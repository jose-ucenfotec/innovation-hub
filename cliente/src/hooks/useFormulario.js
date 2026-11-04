import { useState } from 'react';

export function useFormulario(inicial, reglas) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);

  const validar = (nombre, todos) => reglas[nombre]?.(todos[nombre], todos) ?? null;

  // cada cambio revalida y el mensaje desaparece en cuanto el dato es válido.
  // También se revalidan los campos que ya tenían error, para reglas entre campos.
  function cambiar(nombre, valor) {
    const siguiente = { ...valores, [nombre]: valor };
    setValores(siguiente);
    setErrores((previos) => {
      const nuevos = { ...previos };
      for (const n of Object.keys(reglas)) {
        const revalidar = n === nombre ? tocados[n] || enviado : Boolean(previos[n]);
        if (revalidar) nuevos[n] = validar(n, siguiente);
      }
      return nuevos;
    });
  }

  function tocar(nombre) {
    setTocados((previos) => ({ ...previos, [nombre]: true }));
    setErrores((previos) => ({ ...previos, [nombre]: validar(nombre, valores) }));
  }

  function validarTodo() {
    setEnviado(true);
    const nuevos = Object.fromEntries(Object.keys(reglas).map((n) => [n, validar(n, valores)]));
    setErrores(nuevos);
    const primero = Object.keys(nuevos).find((n) => nuevos[n]);
    if (primero) document.getElementById(primero)?.focus();
    return !primero;
  }

  // Muestra en cada campo los detalles de un 400 del servidor.
  function erroresDelServidor(details = []) {
    setErrores((previos) => ({ ...previos, ...Object.fromEntries(details.map((d) => [d.field, d.message])) }));
  }

  function reiniciar(nuevos) {
    setValores(nuevos);
    setErrores({});
    setTocados({});
    setEnviado(false);
  }

  const campo = (nombre) => ({
    id: nombre,
    valor: valores[nombre],
    error: errores[nombre],
    onChange: (v) => cambiar(nombre, v),
    onBlur: () => tocar(nombre),
  });

  return { valores, errores, cambiar, validarTodo, erroresDelServidor, reiniciar, campo };
}