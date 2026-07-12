"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { neuCardHover } from "@/lib/animations";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      animate="rest"
      variants={neuCardHover}
      className={`glass-card rounded-3xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
