import React, { InputHTMLAttributes, forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-subtle pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg bg-surface-card border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-border-subtle focus:border-brand-primary focus:ring-brand-primary/40'
            } text-text-main placeholder-text-subtle px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${
              leftIcon ? 'pl-10' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-text-subtle">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
