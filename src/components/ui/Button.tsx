"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "amber";

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
    "bg-blue-600 text-white font-bold border border-blue-500 shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200",
  amber:
    "bg-amber-500 text-slate-900 font-bold border border-amber-400 shadow-md shadow-amber-500/20 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200",
  secondary:
    "bg-white border border-slate-200 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200",
  outline:
    "border-2 border-slate-300 text-slate-800 bg-transparent hover:bg-slate-100/60 font-semibold transition-all duration-200",
  ghost:
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all duration-200",
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
  const buttonClasses = `inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={buttonClasses}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
