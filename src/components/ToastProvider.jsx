import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const quitar = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const mostrar = useCallback(
    (mensaje, tipo) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, mensaje, tipo }]);
      timers.current[id] = setTimeout(() => quitar(id), 3500);
    },
    [quitar]
  );

  const value = {
    showSuccess: (mensaje) => mostrar(mensaje, 'success'),
    showError: (mensaje) => mostrar(mensaje, 'error')
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-stack">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.tipo}`}>
              <span>{toast.mensaje}</span>
              <button type="button" onClick={() => quitar(toast.id)} aria-label="Cerrar">
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
