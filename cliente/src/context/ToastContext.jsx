import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const quitar = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback((mensaje, tipo = 'success') => {
    const id = crypto.randomUUID();
    setToasts((lista) => [...lista, { id, mensaje, tipo }]);
    setTimeout(() => quitar(id), 4500);
  }, [quitar]);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show align-items-center text-bg-${t.tipo} border-0`} role="status" aria-live="polite">
            <div className="d-flex">
              <div className="toast-body">{t.mensaje}</div>
              <button
                type="button"
                className={`btn-close me-2 m-auto${['success', 'warning', 'light'].includes(t.tipo) ? '' : ' btn-close-white'}`}
                aria-label="Cerrar"
                onClick={() => quitar(t.id)}
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);