"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, hint, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-150 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

NeuInput.displayName = "NeuInput";

export default NeuInput;
