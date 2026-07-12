"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-[#475569]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 disabled:opacity-50 ${
            error ? "border-red-400" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

NeuInput.displayName = "NeuInput";

export default NeuInput;
