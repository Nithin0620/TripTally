"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, boxShadow: "0 20px 40px rgba(239, 236, 7, 0.2)" } : {}}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-3xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
