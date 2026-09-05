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
          <label className="mb-2 block text-sm font-medium text-brand-text/75">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`neu-input w-full rounded-2xl px-4 py-3 text-brand-text placeholder-brand-text/40 transition-all duration-300 disabled:opacity-50 ${
            error ? "border-red-400 focus:box-shadow-none" : ""
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
