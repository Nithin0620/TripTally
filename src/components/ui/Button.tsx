"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

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
    "bg-brand-accent text-brand-text font-bold shadow-[0_0_24px_rgba(239,236,7,0.35)] hover:shadow-[0_0_30px_rgba(239,236,7,0.55)] hover:brightness-95",
  secondary:
    "bg-brand-surface text-brand-text backdrop-blur-md border border-[#b9d3c5] hover:border-brand-accent hover:shadow-[0_0_20px_rgba(239,236,7,0.2)]",
  outline:
    "border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-text",
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
  const buttonClasses = `inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={buttonClasses}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
