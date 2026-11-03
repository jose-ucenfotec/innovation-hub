import Modal from './Modal.jsx';

export default function ModalConfirmacion({
  abierto, titulo, textoConfirmar = 'Confirmar', variante = 'danger', icono = 'bi-exclamation-triangle-fill',
  procesando = false, onConfirmar, onCancelar, children,
}) {
  return (
    <Modal
      abierto={abierto}
      id="confirmacion"
      onCerrar={procesando ? () => {} : onCancelar}
      titulo={<><i className={`bi ${icono}`} aria-hidden="true"></i> {titulo}</>}
      pie={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={procesando}>Cancelar</button>
          <button type="button" className={`btn btn-${variante}`} onClick={onConfirmar} disabled={procesando} data-autofocus>
            {procesando && <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>}
            {textoConfirmar}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}