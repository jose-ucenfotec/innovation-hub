document.getElementById('navbar').innerHTML = IH.ui.renderNavbar('catalogo.html', '../');

const filtrosEstado = { texto: '', tipo: '', categoria: '', competencia: '' };

function llenarSelect(select, opciones, etiqueta) {
  select.innerHTML = `<option value="">${etiqueta}</option>` +
    opciones.map((o) => `<option value="${o.id}">${IH.ui.escapar(o.nombre)}</option>`).join('');
}

function coincide(ini) {
  const texto = filtrosEstado.texto.trim().toLowerCase();
  const coincideTexto = !texto ||
    ini.titulo.toLowerCase().includes(texto) ||
    ini.resumen.toLowerCase().includes(texto);
  const coincideTipo = !filtrosEstado.tipo || ini.tipo === filtrosEstado.tipo;
  const coincideCategoria = !filtrosEstado.categoria || ini.categoria === filtrosEstado.categoria;
  const coincideCompetencia = !filtrosEstado.competencia || ini.competencias.includes(filtrosEstado.competencia);
  return coincideTexto && coincideTipo && coincideCategoria && coincideCompetencia;
}

function renderLista() {
  const ctx = IH.almacen.contexto();
  const visibles = IH.almacen.obtenerIniciativas().filter(coincide);
  document.getElementById('lista').innerHTML = visibles.map((i) => IH.ui.tarjetaIniciativa(i, ctx)).join('');
  document.getElementById('vacio').hidden = visibles.length > 0;
}

async function iniciar() {
  const cargando = document.getElementById('cargando');
  const error = document.getElementById('error');
  try {
    const datos = await IH.datos.cargarDatos('../datos/');
    IH.almacen.inicializar(datos);
    llenarSelect(document.getElementById('f-categoria'), datos.categorias, 'Todas');
    llenarSelect(document.getElementById('f-competencia'), datos.competencias, 'Todas');
    cargando.hidden = true;
    renderLista();
  } catch (e) {
    cargando.hidden = true;
    error.hidden = false;
    error.textContent = 'No se pudieron cargar las iniciativas. Recargá la página para volver a intentar.';
  }
}

document.getElementById('filtros').addEventListener('input', (e) => {
  if (e.target.name) filtrosEstado[e.target.name] = e.target.value;
  renderLista();
});
document.getElementById('limpiar').addEventListener('click', () => {
  setTimeout(() => { Object.keys(filtrosEstado).forEach((k) => (filtrosEstado[k] = '')); renderLista(); }, 0);
});

iniciar();