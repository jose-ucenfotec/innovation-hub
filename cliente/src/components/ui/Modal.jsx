import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Modal de Bootstrap controlado por estado de React. El contenido llega por children.
export default function Modal({ abierto, titulo, onCerrar, children, pie, id = 'modal' }) {
  const refDialogo = useRef(null);
  const refCerrar = useRef(onCerrar);
  useEffect(() => { refCerrar.current = onCerrar; });

  useEffect(() => {
    if (!abierto) return undefined;
    const anterior = document.activeElement;
    refDialogo.current?.querySelector('[data-autofocus], button')?.focus();
    const alPresionar = (e) => { if (e.key === 'Escape') refCerrar.current(); };
    document.addEventListener('keydown', alPresionar);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.classList.remove('modal-open');
      anterior?.focus?.();
    };
  }, [abierto]);

  if (!abierto) return null;
  return createPortal(
    <>
      <div
        className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby={`${id}-titulo`}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
      >
        <div className="modal-dialog modal-dialog-centered" ref={refDialogo}>
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title h5" id={`${id}-titulo`}>{titulo}</h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
            </div>
            <div className="modal-body">{children}</div>
            {pie && <div className="modal-footer border-0 pt-0">{pie}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>,
    document.body
  );
}