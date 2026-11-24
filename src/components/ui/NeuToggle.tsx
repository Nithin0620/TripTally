"use client";

import { motion } from "framer-motion";

interface NeuToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function NeuToggle({
  checked,
  onChange,
  label,
  disabled = false,
}: NeuToggleProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
          checked ? "neu-toggle-active" : "neu-toggle"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`inline-block h-5 w-5 rounded-full shadow-md ${
            checked
              ? "translate-x-6 bg-white"
              : "translate-x-1 bg-white/80"
          }`}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-[#0F172A]">{label}</span>
      )}
    </label>
  );
}
