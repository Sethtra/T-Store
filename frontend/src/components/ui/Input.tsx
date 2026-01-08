import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-[var(--color-bg-elevated)]
            border border-[var(--color-border)]
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-200 ease-out
            focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
            hover:border-[var(--color-border-hover)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                : ""
            }
            ${className}
          `}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-sm ${
              error
                ? "text-[var(--color-error)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
