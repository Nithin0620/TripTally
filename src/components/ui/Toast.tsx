"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`glass-card rounded-2xl px-5 py-3.5 ${
              toast.type === 'success'
                ? 'border-green-400/40 shadow-[0_0_16px_rgba(34,197,94,0.15)]'
                : toast.type === 'error'
                ? 'border-red-400/40 shadow-[0_0_16px_rgba(239,68,68,0.15)]'
                : 'border-brand-blue/30 shadow-[0_0_16px_rgba(59,130,246,0.12)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${
                toast.type === 'success'
                  ? 'text-green-600'
                  : toast.type === 'error'
                  ? 'text-red-500'
                  : 'text-brand-blue'
              }`}>
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <span className="text-sm font-medium text-[#0F172A]">{toast.message}</span>
              <button
                onClick={() => onRemove(toast.id)}
                className="ml-2 text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
