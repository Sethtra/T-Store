import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { ToastContext, type Toast, type ToastType } from "./toastContext";

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />,
  error: <XCircle className="w-5 h-5 text-[var(--color-error)]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />,
  info: <Info className="w-5 h-5 text-[var(--color-info)]" />,
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      role={toast.type === "error" ? "alert" : "status"}
      className="flex items-start gap-3 pl-4 pr-2 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] w-[min(24rem,calc(100vw-2rem))]"
    >
      <span className="mt-0.5 shrink-0">{toastIcons[toast.type]}</span>
      <p className="text-sm font-medium text-[var(--color-text-primary)] flex-1 leading-snug pt-0.5">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="grid place-items-center w-7 h-7 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success", duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
