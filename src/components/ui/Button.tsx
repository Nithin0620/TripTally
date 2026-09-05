"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-accent text-white font-bold border border-transparent shadow-sm hover:brightness-105 hover:shadow-md transition-all duration-300",
  secondary:
    "bg-brand-surface-alt/40 border border-brand-sand/65 text-brand-text font-semibold hover:bg-brand-surface-alt/70 transition-all duration-300",
  outline:
    "border border-brand-accent text-brand-accent bg-transparent hover:bg-brand-accent hover:text-white transition-all duration-300",
  ghost:
    "text-brand-text/70 hover:text-brand-text hover:bg-brand-surface-alt/40 transition-all duration-300",
};

export default function Button({
  href,
  onClick,
  children,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const buttonClasses = `inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href}>
        <motion.button
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={buttonClasses}
          type={type}
          disabled={disabled}
        >
          {children}
        </motion.button>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={buttonClasses}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
