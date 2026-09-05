"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Toast as ToastType } from '@/hooks/useToast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {toast.type === 'success' && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              {toast.type === 'info' && (
                <Info className="h-4 w-4 shrink-0 text-blue-600" />
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
