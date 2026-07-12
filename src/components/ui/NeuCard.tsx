"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { neuCardHover } from "@/lib/animations";

interface NeuCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "raised" | "glass" | "inset";
}

export default function NeuCard({
  children,
  className = "",
  hover = true,
  variant = "glass",
}: NeuCardProps) {
  const variantClasses = {
    raised: "neu-raised rounded-3xl p-6",
    glass: "glass-card rounded-3xl p-6",
    inset: "neu-inset rounded-3xl p-6",
  };

  return (
    <motion.div
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      animate="rest"
      variants={neuCardHover}
      className={`${variantClasses[variant]} transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
