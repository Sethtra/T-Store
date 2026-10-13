import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

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
  /** @deprecated kept for API compatibility; no visual effect */
  shimmer?: boolean;
  /** @deprecated kept for API compatibility; no visual effect */
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Associates a submit button with a form elsewhere on the page */
  form?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] select-none whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out " +
  "active:translate-y-px disabled:opacity-45 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)]";

const variants = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)]",
  gradient:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-sm)]",
  secondary:
    "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]",
  outline:
    "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-hover)] hover:border-[var(--color-text-primary)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]",
  danger: "bg-[var(--color-error)] text-white hover:brightness-110",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  type = "button",
  form,
  onClick,
}: ButtonProps) => (
  <button
    className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    type={type}
    form={form}
    onClick={onClick}
  >
    {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
    {children}
  </button>
);

export default Button;
