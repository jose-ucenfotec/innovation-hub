import { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { archivarIniciativa, eliminarIniciativa } from '../../api/iniciativas.js';

export default function AccionesPropietario({ ini, variante = 'detalle', onCambio }) {
  const mostrarToast = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const relaciones = ini.relations ?? { members: 0, requests: 0, hasProject: false };
  const debeArchivar = relaciones.members > 0 || relaciones.requests > 0 || relaciones.hasProject;
  const abierta = ['published', 'forming'].includes(ini.status);
  const puedeConvertir = abierta && relaciones.members > 0;
  const compacto = variante === 'tarjeta';

  if (ini.status === 'archived') {
    return <p className="small text-body-secondary mb-0"><i className="bi bi-archive" aria-hidden="true"></i> Archivada: solo lectura.</p>;
  }

  async function confirmar() {
    setProcesando(true);
    try {
      if (debeArchivar) {
        await archivarIniciativa(ini.id);
        mostrarToast('La iniciativa tenía equipo, solicitudes o proyecto: se archivó en lugar de eliminarse.', 'info');
      } else {
        await eliminarIniciativa(ini.id);
        mostrarToast('Iniciativa eliminada.', 'secondary');
      }
      setConfirmando(false);
      onCambio?.(debeArchivar ? 'archivada' : 'eliminada');
    } catch (error) {
      setConfirmando(false);
      mostrarToast(error.message, 'danger');
    } finally {
      setProcesando(false);
    }
  }

  const tamano = compacto ? ' btn-sm' : '';
  return (
    <>
      <div className={compacto ? 'd-flex flex-wrap gap-2' : 'd-grid gap-2'}>
        <Link className={`btn btn-outline-primary${tamano}`} to={`/iniciativas/${ini.id}/editar`}>
          <i className="bi bi-pencil" aria-hidden="true"></i> Editar
        </Link>
        <button type="button" className={`btn btn-outline-danger${tamano}`} onClick={() => setConfirmando(true)}>
          <i className={`bi ${debeArchivar ? 'bi-archive' : 'bi-trash3'}`} aria-hidden="true"></i> {debeArchivar ? 'Archivar' : 'Eliminar'}
        </button>
        {!compacto && abierta && (
          puedeConvertir
            ? <Link className="btn btn-primary" to={`/iniciativas/${ini.id}/proyecto`}><i className="bi bi-rocket-takeoff" aria-hidden="true"></i> Convertir en proyecto</Link>
            : <p className="small text-body-secondary mb-0">Para convertirla en proyecto necesita al menos un integrante además de vos.</p>
        )}
      </div>

      <ModalConfirmacion
        abierto={confirmando}
        titulo={debeArchivar ? 'Archivar iniciativa' : 'Eliminar iniciativa'}
        textoConfirmar={debeArchivar ? 'Archivar' : 'Eliminar'}
        procesando={procesando}
        onConfirmar={confirmar}
        onCancelar={() => setConfirmando(false)}
      >
        <p className="fw-semibold mb-1">{ini.title}</p>
        <p className="text-body-secondary mb-0">
          {debeArchivar
            ? `Tiene ${relaciones.members} integrante(s) y ${relaciones.requests} solicitud(es)${relaciones.hasProject ? ' y un proyecto' : ''}, así que se archivará en lugar de eliminarse.`
            : 'No tiene equipo ni solicitudes: se eliminará de forma definitiva.'}
        </p>
      </ModalConfirmacion>
    </>
  );
}