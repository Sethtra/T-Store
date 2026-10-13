interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",
  primary: "bg-[var(--color-primary)] text-[var(--color-on-primary)]",
  success: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]",
  warning: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-[var(--color-warning)]",
  error: "bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)]",
  info: "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-[0.8125rem]",
};

const Badge = ({ children, variant = "default", size = "md", className = "" }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 font-medium rounded-[var(--radius-sm)] ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
