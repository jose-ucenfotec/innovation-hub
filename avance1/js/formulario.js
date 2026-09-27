(() => {
  IH.ui.montarNavbar('formulario.html', '../');
  const U = IH.ui;
  const V = IH.validacion;
  const $ = (id) => document.getElementById(id);

  const LIMITES = { titulo: 80, resumen: 160, etiquetas: 5 };
  const REGEX_ETIQUETA = /^[\p{L}\p{N}][\p{L}\p{N}\- ]{1,29}$/u;
  const TIPOS = ['idea', 'necesidad', 'reto'];
  const VISIBILIDADES = ['pública', 'institucional', 'restringida', 'privada'];

  let ctx = null;
  let competenciasElegidas = [];
  let idEnEdicion = null;
  let iniciativaOriginal = null;

  const val = (id) => $(id).value;

  function renderCompetenciasElegidas() {
    $('competencias-elegidas').innerHTML = competenciasElegidas.map((id) => {
      const nombre = ctx.competencias.get(id)?.nombre ?? id;
      return `<li class="badge text-bg-primary competencia-elegida">${U.escapar(nombre)}
        <button type="button" class="btn-close btn-close-white" data-id="${id}" aria-label="Quitar ${U.escapar(nombre)}"></button></li>`;
    }).join('') || '<li class="small text-body-secondary">Todavía no agregaste competencias.</li>';
    // Las ya elegidas se deshabilitan en el select para evitar duplicados.
    [...$('competencia-nueva').options].forEach((o) => { if (o.value) o.disabled = competenciasElegidas.includes(o.value); });
  }

  function leerEtiquetas() {
    return val('etiquetas').split(',').map((t) => t.trim()).filter(Boolean);
  }

  function actualizarContador(id) {
    $('contador-' + id).textContent = `${val(id).length} / ${LIMITES[id]}`;
  }

  function validarFormulario() {
    const etiquetas = leerEtiquetas();
    const minimoIntegrantes = iniciativaOriginal ? iniciativaOriginal.equipo.length + 1 : 1;
    return V.validarCampos([
      ['titulo', () => V.combinar(() => V.requerido(val('titulo')), () => V.longitudMinima(val('titulo'), 5), () => V.longitudMaxima(val('titulo'), LIMITES.titulo))],
      ['tipo', () => V.seleccionValida(val('tipo'), TIPOS)],
      ['resumen', () => V.combinar(() => V.requerido(val('resumen')), () => V.longitudMinima(val('resumen'), 10), () => V.longitudMaxima(val('resumen'), LIMITES.resumen))],
      ['descripcion', () => V.combinar(() => V.requerido(val('descripcion')), () => V.longitudMinima(val('descripcion'), 20))],
      ['problema', () => V.combinar(() => V.requerido(val('problema')), () => V.longitudMinima(val('problema'), 10))],
      ['beneficiarios', () => V.requerido(val('beneficiarios'))],
      ['categoria', () => V.seleccionValida(val('categoria'), [...ctx.categorias.keys()])],
      ['participantes', () => V.combinar(
        () => V.rango(val('participantes'), 1, 20),
        () => V.minimo(val('participantes'), minimoIntegrantes, `El equipo ya tiene ${minimoIntegrantes} integrante(s), incluido el propietario. No podés indicar menos.`)
      )],
      ['visibilidad', () => V.seleccionValida(val('visibilidad'), VISIBILIDADES)],
      ['competencias', () => V.cantidadMinima(competenciasElegidas, 1)],
      ['etiquetas', () => V.combinar(
        () => V.cantidadMaxima(etiquetas, LIMITES.etiquetas),
        () => etiquetas.map((t) => V.formato(t, REGEX_ETIQUETA, `La etiqueta "${t}" solo puede tener letras, números, espacios o guiones (2 a 30 caracteres).`)).find(Boolean) ?? null
      )]
    ]);
  }

  function bloquear(mensaje) {
    $('bloqueo').hidden = false;
    $('bloqueo').innerHTML = `${U.icono('bi-person-lock')}<div>${mensaje}</div>`;
  }

  function cargarEnFormulario(ini) {
    const valores = {
      titulo: ini.titulo, tipo: ini.tipo, resumen: ini.resumen, descripcion: ini.descripcion,
      problema: ini.problema, beneficiarios: ini.beneficiarios, categoria: ini.categoria,
      participantes: ini.participantesEstimados, visibilidad: ini.visibilidad, etiquetas: ini.etiquetas.join(', ')
    };
    Object.entries(valores).forEach(([id, v]) => { $(id).value = v; });
    competenciasElegidas = [...ini.competencias];
  }

  $('agregar-competencia').addEventListener('click', () => {
    const sel = $('competencia-nueva');
    if (!sel.value) { V.mostrarError('competencias', 'Elegí una competencia de la lista antes de agregar.'); return; }
    if (!competenciasElegidas.includes(sel.value)) competenciasElegidas.push(sel.value);
    V.mostrarError('competencias', null);
    sel.value = '';
    renderCompetenciasElegidas();
  });

  // Delegación: un solo escucha para todos los botones de quitar.
  $('competencias-elegidas').addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-id]');
    if (!boton) return;
    competenciasElegidas = competenciasElegidas.filter((id) => id !== boton.dataset.id);
    renderCompetenciasElegidas();
  });

  ['titulo', 'resumen'].forEach((id) => $(id).addEventListener('input', () => actualizarContador(id)));

  $('formulario-iniciativa').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const datos = {
      titulo: val('titulo').trim(),
      tipo: val('tipo'),
      resumen: val('resumen').trim(),
      descripcion: val('descripcion').trim(),
      problema: val('problema').trim(),
      beneficiarios: val('beneficiarios').trim(),
      categoria: val('categoria'),
      competencias: [...competenciasElegidas],
      participantesEstimados: Number(val('participantes')),
      visibilidad: val('visibilidad'),
      etiquetas: leerEtiquetas()
    };

    if (idEnEdicion) {
      IH.almacen.actualizarIniciativa(idEnEdicion, datos);
      window.location.href = `detalle.html?id=${encodeURIComponent(idEnEdicion)}&msg=editada`;
      return;
    }
    IH.almacen.agregarIniciativa({
      id: 'ini-' + Date.now(),
      ...datos,
      propietario: IH.sesion.usuarioActual().id,
      estado: 'publicada',
      equipo: []
    });
    window.location.href = 'catalogo.html?msg=creada';
  });

  IH.ui.cargarPagina('../', (datos) => {
    ctx = IH.almacen.contexto();
    const usuario = IH.sesion.usuarioActual();
    if (!usuario) {
      bloquear('Para publicar una iniciativa necesitás una sesión. Elegí un usuario en <strong>Ver como</strong>, en la barra superior.');
      return;
    }

    $('categoria').innerHTML += datos.categorias.map((c) => `<option value="${c.id}">${U.escapar(c.nombre)}</option>`).join('');
    $('competencia-nueva').innerHTML += datos.competencias.map((c) => `<option value="${c.id}">${U.escapar(c.nombre)}</option>`).join('');

    idEnEdicion = new URLSearchParams(window.location.search).get('id');
    if (idEnEdicion) {
      iniciativaOriginal = IH.almacen.obtenerIniciativa(idEnEdicion);
      if (!iniciativaOriginal) { bloquear('No encontramos la iniciativa que querés editar.'); return; }
      if (!IH.reglas.esPropietario(iniciativaOriginal, usuario)) { bloquear('Solo el propietario puede modificar esta iniciativa (RN-06).'); return; }
      if (!IH.reglas.puedeEditarse(iniciativaOriginal)) { bloquear('Una iniciativa archivada no se puede modificar.'); return; }
      $('titulo-pagina').textContent = 'Editar iniciativa';
      document.title = 'Editar iniciativa · Innovation Hub';
      cargarEnFormulario(iniciativaOriginal);
    }

    renderCompetenciasElegidas();
    ['titulo', 'resumen'].forEach(actualizarContador);
    $('formulario-iniciativa').hidden = false;
  });
})();