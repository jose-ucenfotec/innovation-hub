window.IH = window.IH || {};

IH.validacion = (function () {
  function requerido(valor) {
    return valor && valor.trim().length > 0 ? null : 'Este campo es obligatorio.';
  }
  function longitudMinima(valor, min) {
    return valor.trim().length >= min ? null : `Debe tener al menos ${min} caracteres.`;
  }
  function rango(valor, min, max) {
    const n = Number(valor);
    if (Number.isNaN(n)) return 'Debe ser un número.';
    return n >= min && n <= max ? null : `Debe estar entre ${min} y ${max}.`;
  }
  function cantidadMinima(arreglo, min) {
    return arreglo.length >= min ? null : `Agregá al menos ${min} elemento(s).`;
  }

  function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    const feedback = document.getElementById('error-' + idCampo);
    if (feedback) { feedback.textContent = mensaje || ''; feedback.hidden = !mensaje; }
    if (campo) campo.classList.toggle('is-invalid', !!mensaje);
  }

  return { requerido, longitudMinima, rango, cantidadMinima, mostrarError };
})();