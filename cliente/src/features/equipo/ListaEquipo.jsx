import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar.jsx';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { retirarMiembro } from '../../api/iniciativas.js';
import { formatearFecha } from '../../utils/fechas.js';

export default function ListaEquipo({ ini, puedeRetirar = false, onCambio }) {
  const mostrarToast = useToast();
  const [porRetirar, setPorRetirar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  async function confirmar() {
    setProcesando(true);
    try {
      await retirarMiembro(ini.id, porRetirar.userId);
      mostrarToast(`${porRetirar.fullName} ya no forma parte del equipo.`, 'secondary');
      setPorRetirar(null);
      onCambio?.();
    } catch (error) {
      mostrarToast(error.message, 'danger');
      setPorRetirar(null);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <>
      <ul className="list-unstyled mb-3">
        <li className="d-flex align-items-center gap-2 mb-2">
          <Avatar nombre={ini.owner.fullName} />
          <span><Link to={`/usuarios/${ini.owner.id}`}>{ini.owner.fullName}</Link> <span className="small text-body-secondary">· propietario</span></span>
        </li>
        {ini.members.map((m) => (
          <li key={m.userId} className="d-flex align-items-center gap-2 mb-2">
            <Avatar nombre={m.fullName} />
            <span className="flex-grow-1">
              <Link to={`/usuarios/${m.userId}`}>{m.fullName}</Link>
              <span className="d-block small text-body-secondary">{m.role.name} · {m.career} · desde {formatearFecha(m.joinedAt)}</span>
            </span>
            {puedeRetirar && (
              <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Retirar a ${m.fullName} del equipo`} onClick={() => setPorRetirar(m)}>
                <i className="bi bi-person-dash" aria-hidden="true"></i>
              </button>
            )}
          </li>
        ))}
        {ini.members.length === 0 && <li className="small text-body-secondary">Todavía no hay integrantes además del propietario.</li>}
      </ul>

      <ModalConfirmacion
        abierto={!!porRetirar}
        titulo="Retirar del equipo"
        textoConfirmar="Retirar"
        procesando={procesando}
        onConfirmar={confirmar}
        onCancelar={() => setPorRetirar(null)}
      >
        <p className="mb-0">¿Retirar a <strong>{porRetirar?.fullName}</strong> del equipo de "{ini.title}"?</p>
      </ModalConfirmacion>
    </>
  );
}