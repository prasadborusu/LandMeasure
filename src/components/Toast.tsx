import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-[90vw] max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles = {
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  }[toast.type];

  const Icon = {
    error: AlertCircle,
    warning: AlertCircle,
    success: CheckCircle,
    info: Info,
  }[toast.type];

  const iconColors = {
    error: 'text-red-600',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    info: 'text-blue-600',
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start space-x-2.5 p-3.5 rounded-xl border shadow-lg text-xs font-medium w-full animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xs ${bgStyles}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColors}`} />
      <div className="flex-1">
        {toast.title && <div className="font-bold mb-0.5">{toast.title}</div>}
        <div className="leading-snug">{toast.message}</div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
