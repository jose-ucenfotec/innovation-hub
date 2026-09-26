document.getElementById('navbar').innerHTML = IH.ui.renderNavbar('formulario.html', '../');

const USUARIO_ACTUAL_ID = 'u1';
let competenciasElegidas = [];
let idEnEdicion = null;
let mapaCompetencias = new Map();

function renderCompetenciasElegidas() {
  const ul = document.getElementById('competencias-elegidas');
  ul.innerHTML = competenciasElegidas.map((id) => {
    const nombre = mapaCompetencias.get(id)?.nombre ?? id;
    return `<li class="list-inline-item badge text-bg-primary">${IH.ui.escapar(nombre)}
      <button type="button" class="btn-close btn-close-white btn-sm" data-id="${id}" aria-label="Quitar ${IH.ui.escapar(nombre)}"></button></li>`;
  }).join('');
}

function validarFormulario() {
  const V = IH.validacion;
  let valido = true;
  const campos = [
    ['titulo', () => V.requerido(document.getElementById('titulo').value)],
    ['resumen', () => V.longitudMinima(document.getElementById('resumen').value, 10)],
    ['descripcion', () => V.longitudMinima(document.getElementById('descripcion').value, 20)],
    ['problema', () => V.requerido(document.getElementById('problema').value)],
    ['beneficiarios', () => V.requerido(document.getElementById('beneficiarios').value)],
    ['categoria', () => V.requerido(document.getElementById('categoria').value)],
    ['participantes', () => V.rango(document.getElementById('participantes').value, 1, 20)]
  ];
  campos.forEach(([id, validar]) => {
    const mensaje = validar();
    V.mostrarError(id, mensaje);
    if (mensaje) valido = false;
  });
  const mensajeCompetencias = V.cantidadMinima(competenciasElegidas, 1);
  V.mostrarError('competencias', mensajeCompetencias);
  if (mensajeCompetencias) valido = false;
  return valido;
}

async function iniciar() {
  const datos = await IH.datos.cargarDatos('../datos/');
  IH.almacen.inicializar(datos);
  mapaCompetencias = new Map(datos.competencias.map((c) => [c.id, c]));

  const selCategoria = document.getElementById('categoria');
  selCategoria.innerHTML += datos.categorias.map((c) => `<option value="${c.id}">${IH.ui.escapar(c.nombre)}</option>`).join('');
  const selCompetencia = document.getElementById('competencia-nueva');
  selCompetencia.innerHTML += datos.competencias.map((c) => `<option value="${c.id}">${IH.ui.escapar(c.nombre)}</option>`).join('');

  idEnEdicion = new URLSearchParams(window.location.search).get('id');
  if (idEnEdicion) {
    const ini = IH.almacen.obtenerIniciativa(idEnEdicion);
    document.getElementById('titulo-pagina').textContent = 'Editar iniciativa';
    document.getElementById('titulo').value = ini.titulo;
    document.getElementById('tipo').value = ini.tipo;
    document.getElementById('resumen').value = ini.resumen;
    document.getElementById('descripcion').value = ini.descripcion;
    document.getElementById('problema').value = ini.problema;
    document.getElementById('beneficiarios').value = ini.beneficiarios;
    document.getElementById('categoria').value = ini.categoria;
    document.getElementById('participantes').value = ini.participantesEstimados;
    document.getElementById('visibilidad').value = ini.visibilidad;
    document.getElementById('etiquetas').value = ini.etiquetas.join(', ');
    competenciasElegidas = [...ini.competencias];
    renderCompetenciasElegidas();
  }
}

document.getElementById('agregar-competencia').addEventListener('click', () => {
  const sel = document.getElementById('competencia-nueva');
  if (sel.value && !competenciasElegidas.includes(sel.value)) {
    competenciasElegidas.push(sel.value);
    renderCompetenciasElegidas();
  }
  sel.value = '';
});

document.getElementById('competencias-elegidas').addEventListener('click', (e) => {
  const boton = e.target.closest('button[data-id]');
  if (!boton) return;
  competenciasElegidas = competenciasElegidas.filter((id) => id !== boton.dataset.id);
  renderCompetenciasElegidas();
});

document.getElementById('formulario-iniciativa').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;

  const datosFormulario = {
    titulo: document.getElementById('titulo').value.trim(),
    tipo: document.getElementById('tipo').value,
    resumen: document.getElementById('resumen').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    problema: document.getElementById('problema').value.trim(),
    beneficiarios: document.getElementById('beneficiarios').value.trim(),
    categoria: document.getElementById('categoria').value,
    competencias: competenciasElegidas,
    participantesEstimados: Number(document.getElementById('participantes').value),
    visibilidad: document.getElementById('visibilidad').value,
    etiquetas: document.getElementById('etiquetas').value.split(',').map((t) => t.trim()).filter(Boolean)
  };

  if (idEnEdicion) {
    IH.almacen.actualizarIniciativa(idEnEdicion, datosFormulario);
  } else {
    IH.almacen.agregarIniciativa({
      id: 'ini-' + Date.now(),
      ...datosFormulario,
      propietario: USUARIO_ACTUAL_ID,
      estado: 'abierta',
      equipo: []
    });
  }
  window.location.href = 'catalogo.html';
});

iniciar();