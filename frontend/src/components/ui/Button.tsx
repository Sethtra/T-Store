import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  type = "button",
  onClick,
}: ButtonProps) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-hover)]
      focus:ring-[var(--color-primary)]
      active:scale-[0.98]
    `,
    secondary: `
      bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]
      hover:bg-[var(--color-bg-surface)]
      focus:ring-[var(--color-border-hover)]
      border border-[var(--color-border)]
      active:scale-[0.98]
    `,
    outline: `
      bg-transparent text-[var(--color-primary)]
      border-2 border-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white
      focus:ring-[var(--color-primary)]
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]
      focus:ring-[var(--color-border)]
      active:scale-[0.98]
    `,
    danger: `
      bg-[var(--color-error)] text-white
      hover:bg-red-600
      focus:ring-[var(--color-error)]
      active:scale-[0.98]
    `,
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
