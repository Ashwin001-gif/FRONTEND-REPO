import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type, show: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t));
    }, 10);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, show: false } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 400);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const icons = {
            info: 'fa-circle-info',
            success: 'fa-check-circle',
            warning: 'fa-triangle-exclamation',
            danger: 'fa-circle-xmark',
            error: 'fa-circle-xmark'
          };
          const colors = {
            info: 'var(--blue-bright)',
            success: 'var(--success)',
            warning: 'var(--warning)',
            danger: 'var(--danger)',
            error: 'var(--error)'
          };
          return (
            <div key={t.id} className={`toast ${t.type} ${t.show ? 'show' : ''}`}>
              <i className={`fa-solid ${icons[t.type]}`} style={{ color: colors[t.type], fontSize: 15 }}></i>
              <span>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
