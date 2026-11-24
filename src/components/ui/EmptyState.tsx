"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { Compass } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center backdrop-blur-sm"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon || <Compass className="h-6 w-6 text-slate-500" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="mx-auto max-w-sm text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (onAction || actionHref) && (
          <Button variant="primary" onClick={onAction} href={actionHref} className="text-xs py-2 px-4">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && (onSecondaryAction || secondaryActionHref) && (
          <Button
            variant="secondary"
            onClick={onSecondaryAction}
            href={secondaryActionHref}
            className="text-xs py-2 px-4"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
