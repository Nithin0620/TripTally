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
    "bg-brand-accent text-brand-text font-bold shadow-neu-yellow hover:shadow-neu-yellow-lg hover:brightness-95 active:shadow-neu-inset-sm",
  secondary:
    "neu-button text-[#0F172A] hover:border-brand-blue/30 hover:shadow-[4px_4px_8px_rgba(163,177,198,0.35),-4px_-4px_8px_rgba(255,255,255,0.5),0_0_8px_rgba(59,130,246,0.07)]",
  outline:
    "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]",
  ghost:
    "text-[#475569] hover:text-[#0F172A] hover:bg-white/50",
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
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
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
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={buttonClasses}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
