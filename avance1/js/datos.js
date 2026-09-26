window.IH = window.IH || {};

IH.datos = (function () {
  async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta} (${respuesta.status})`);
    return respuesta.json();
  }

  async function cargarDatos(base = 'datos/') {
    const [iniciativas, categorias, competencias, usuarios, solicitudes] = await Promise.all([
      cargarJSON(base + 'iniciativas.json'),
      cargarJSON(base + 'categorias.json'),
      cargarJSON(base + 'competencias.json'),
      cargarJSON(base + 'usuarios.json'),
      cargarJSON(base + 'solicitudes.json')
    ]);
    return { iniciativas, categorias, competencias, usuarios, solicitudes };
  }

  return { cargarJSON, cargarDatos };
})();