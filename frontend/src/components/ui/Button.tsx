import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children?: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  shimmer?: boolean;
  glow?: boolean;
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
  shimmer = false,
  glow = false,
  className = "",
  disabled,
  type = "button",
  onClick,
}: ButtonProps) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-300 ease-out relative overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-[var(--color-primary)]/25
      focus:ring-[var(--color-primary)]
    `,
    secondary: `
      bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]
      hover:bg-[var(--color-bg-surface)]
      focus:ring-[var(--color-border-hover)]
      border border-[var(--color-border)]
    `,
    outline: `
      bg-transparent text-[var(--color-primary)]
      border-2 border-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/25
      focus:ring-[var(--color-primary)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]
      focus:ring-[var(--color-border)]
    `,
    danger: `
      bg-[var(--color-error)] text-white
      hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25
      focus:ring-[var(--color-error)]
    `,
    gradient: `
      bg-gradient-to-r from-[var(--color-primary)] to-[#8b5cf6] text-white
      hover:shadow-lg hover:shadow-[var(--color-primary)]/30
      focus:ring-[var(--color-primary)]
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-base gap-2",
    lg: "px-7 py-3.5 text-lg gap-2.5",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${shimmer ? "shimmer-effect" : ""}
        ${glow ? "hover-glow" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
    >
      {/* Shimmer overlay */}
      {shimmer && (
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </span>
      )}

      {isLoading && (
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="-ml-1 mr-2 h-5 w-5"
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
        </motion.svg>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default Button;
