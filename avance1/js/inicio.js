(() => {
  IH.ui.montarNavbar('index.html', '');

  // La portada funciona sin datos. Si el fetch falla (por ejemplo, abierta con
  // doble clic sin abrir desde el servidor), simplemente no se muestran las cifras.
  IH.datos.cargarDatos('datos/').then((datos) => {
    IH.almacen.inicializar(datos);
    IH.ui.actualizarVerComo(datos.usuarios);
    const activas = IH.almacen.obtenerIniciativas().filter((i) => i.estado !== 'archivada');
    document.getElementById('n-iniciativas').textContent = activas.length;
    document.getElementById('n-proyectos').textContent = activas.filter((i) => i.estado === 'proyecto').length;
    document.getElementById('n-personas').textContent = datos.usuarios.length;
    document.getElementById('n-competencias').textContent = datos.competencias.length;
    document.getElementById('estadisticas').hidden = false;
  }).catch((e) => console.warn('Cifras no disponibles:', e.message));
})();