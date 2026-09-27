(() => {
  IH.ui.montarNavbar('catalogo.html', '../');

  const filtros = { texto: '', tipo: '', categoria: '', competencia: '' };
  const $ = (id) => document.getElementById(id);

  function llenarSelect(select, opciones, etiqueta) {
    select.innerHTML = `<option value="">${etiqueta}</option>` +
      opciones.map((o) => `<option value="${o.id}">${IH.ui.escapar(o.nombre)}</option>`).join('');
  }

  // Búsqueda textual sobre título, resumen y etiquetas.
  function coincide(ini) {
    const texto = filtros.texto.trim().toLowerCase();
    const enTexto = !texto || [ini.titulo, ini.resumen, ...ini.etiquetas].some((t) => t.toLowerCase().includes(texto));
    const enTipo = !filtros.tipo || ini.tipo === filtros.tipo;
    const enCategoria = !filtros.categoria || ini.categoria === filtros.categoria;
    const enCompetencia = !filtros.competencia || ini.competencias.includes(filtros.competencia);
    return enTexto && enTipo && enCategoria && enCompetencia;
  }

  function renderLista() {
    const ctx = IH.almacen.contexto();
    const usuario = IH.sesion.usuarioActual();
    const visibles = IH.almacen.obtenerIniciativas()
      .filter((i) => IH.reglas.visibleEnCatalogo(i, usuario))
      .filter(coincide);
    $('lista').innerHTML = visibles.map((i) => IH.ui.tarjetaIniciativa(i, ctx)).join('');
    $('vacio').hidden = visibles.length > 0;
    $('conteo').textContent = visibles.length === 1 ? '1 iniciativa' : `${visibles.length} iniciativas`;
  }

  function limpiar() {
    Object.keys(filtros).forEach((k) => (filtros[k] = ''));
    renderLista();
  }

  $('filtros').addEventListener('input', (e) => {
    if (e.target.name) filtros[e.target.name] = e.target.value;
    renderLista();
  });
  // El evento reset se dispara antes de que el navegador vacíe los campos.
  $('filtros').addEventListener('reset', () => setTimeout(limpiar, 0));
  $('limpiar-desde-vacio').addEventListener('click', () => $('filtros').reset());

  IH.ui.cargarPagina('../', (datos) => {
    llenarSelect($('f-categoria'), datos.categorias, 'Todas');
    llenarSelect($('f-competencia'), datos.competencias, 'Todas');
    renderLista();
    IH.ui.mostrarMensajeDeUrl();
  });
})();