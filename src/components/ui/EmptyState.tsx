"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import Button from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export default function EmptyState({
  icon = "✨",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="glass-card rounded-3xl p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full neu-inset text-4xl"
      >
        {icon}
      </motion.div>
      <h3 className="mb-2 text-xl font-bold text-[#0F172A]">{title}</h3>
      {description && (
        <p className="mb-6 text-[#64748B]">{description}</p>
      )}
      {actionLabel && (onAction || actionHref) && (
        <Button variant="primary" onClick={onAction} href={actionHref}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
