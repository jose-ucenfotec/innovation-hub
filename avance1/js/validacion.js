window.IH = window.IH || {};

IH.validacion = (function () {
  function requerido(valor) {
    return valor && String(valor).trim().length > 0 ? null : 'Este campo es obligatorio.';
  }
  function longitudMinima(valor, min) {
    return String(valor).trim().length >= min ? null : `Debe tener al menos ${min} caracteres.`;
  }
  function longitudMaxima(valor, max) {
    return String(valor).trim().length <= max ? null : `No debe superar los ${max} caracteres.`;
  }
  function rango(valor, min, max) {
    const n = Number(valor);
    if (valor === '' || Number.isNaN(n)) return 'Debe ser un número.';
    return n >= min && n <= max ? null : `Debe estar entre ${min} y ${max}.`;
  }
  function minimo(valor, min, mensaje) {
    return Number(valor) >= min ? null : mensaje;
  }
  function formato(valor, regex, mensaje) {
    return regex.test(String(valor).trim()) ? null : mensaje;
  }
  function seleccionValida(valor, opciones) {
    if (!valor) return 'Elegí una opción.';
    return opciones.includes(valor) ? null : 'Elegí una opción válida.';
  }
  function cantidadMinima(arreglo, min) {
    return arreglo.length >= min ? null : `Agregá al menos ${min} elemento${min === 1 ? '' : 's'}.`;
  }
  function cantidadMaxima(arreglo, max) {
    return arreglo.length <= max ? null : `Podés indicar como máximo ${max}.`;
  }
  // Ejecuta reglas en orden y devuelve el primer mensaje de error.
  function combinar(...reglas) {
    for (const regla of reglas) {
      const mensaje = regla();
      if (mensaje) return mensaje;
    }
    return null;
  }

  function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    const feedback = document.getElementById('error-' + idCampo);
    if (feedback) {
      feedback.innerHTML = mensaje
        ? `<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> ${IH.ui.escapar(mensaje)}`
        : '';
      feedback.hidden = !mensaje;
    }
    if (campo) {
      campo.classList.toggle('is-invalid', !!mensaje);
      campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
      if (feedback) campo.setAttribute('aria-describedby', feedback.id);
    }
  }

  function validarCampos(campos) {
    let primerInvalido = null;
    campos.forEach(([id, validar]) => {
      const mensaje = validar();
      mostrarError(id, mensaje);
      if (mensaje && !primerInvalido) primerInvalido = id;
    });
    if (primerInvalido) document.getElementById(primerInvalido)?.focus();
    return primerInvalido === null;
  }

  return {
    requerido, longitudMinima, longitudMaxima, rango, minimo, formato, seleccionValida,
    cantidadMinima, cantidadMaxima, combinar, mostrarError, validarCampos
  };
})();