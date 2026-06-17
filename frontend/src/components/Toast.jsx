import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration, exiting: false }]);

    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 260);
  }, []);

  const toast = useCallback(
    {
      success: (msg, dur) => addToast(msg, 'success', dur),
      error: (msg, dur) => addToast(msg, 'error', dur),
      info: (msg, dur) => addToast(msg, 'info', dur),
    },
    [addToast]
  );

  // Reassign methods properly
  toast.success = (msg, dur) => addToast(msg, 'success', dur);
  toast.error = (msg, dur) => addToast(msg, 'error', dur);
  toast.info = (msg, dur) => addToast(msg, 'info', dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

const typeStyles = {
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: (
      <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    ),
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: (
      <svg className="w-4.5 h-4.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  },
  info: {
    border: 'border-brand-500/30',
    bg: 'bg-brand-500/10',
    icon: (
      <svg className="w-4.5 h-4.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),
  },
};

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => {
        const style = typeStyles[t.type] || typeStyles.info;
        return (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
              border backdrop-blur-xl shadow-lg
              bg-surface-900/90 ${style.border}
              ${t.exiting ? 'animate-toast-out' : 'animate-toast-in'}
              max-w-sm
            `}
          >
            <div className={`flex-shrink-0 p-1 rounded-lg ${style.bg}`}>{style.icon}</div>
            <p className="text-sm text-surface-200 flex-1">{t.message}</p>
            <button
              className="flex-shrink-0 text-surface-500 hover:text-surface-300 transition-colors"
              onClick={() => onDismiss(t.id)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
