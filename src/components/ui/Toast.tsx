'use client';

import {
  createContext, useContext, useState, useCallback, useRef, type ReactNode,
} from 'react';
import { CheckCircle2, XCircle, Download, X } from 'lucide-react';

type ToastType = 'info' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons: Record<ToastType, ReactNode> = {
    info:    <Download size={16} className="text-blue-400 shrink-0" />,
    success: <CheckCircle2 size={16} className="text-green-400 shrink-0" />,
    error:   <XCircle size={16} className="text-red-400 shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    info:    'border-blue-500/30',
    success: 'border-green-500/30',
    error:   'border-red-500/30',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — bottom right, above player */}
      <div className="fixed bottom-28 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
              bg-[#1c1c1e]/95 backdrop-blur-xl border ${borders[toast.type]}
              shadow-2xl text-white text-sm font-medium
              animate-in slide-in-from-right-4 fade-in duration-200
            `}
          >
            {icons[toast.type]}
            <span className="max-w-[220px] leading-snug">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-1 text-white/30 hover:text-white transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
