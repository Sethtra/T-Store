import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = "", id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const messageId = inputId ? `${inputId}-message` : undefined;
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={`w-full h-12 px-3.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border text-[var(--color-text-primary)] text-base placeholder:text-[var(--color-text-muted)] transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-[var(--color-text-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-light)] disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-[var(--color-error)]"
                : "border-[var(--color-border-hover)] hover:border-[var(--color-text-muted)]"
            } ${icon ? "pl-11" : ""} ${isPasswordType ? "pr-12" : ""} ${className}`}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          )}
        </div>

        {error ? (
          <p id={messageId} role="alert" className="mt-1.5 text-sm text-[var(--color-error)]">
            {error}
          </p>
        ) : helperText ? (
          <p id={messageId} className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
