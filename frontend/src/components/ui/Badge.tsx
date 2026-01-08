interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) => {
  const variants = {
    default: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",
    primary: "bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]",
    success: "bg-[var(--color-success)]/20 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]",
    error: "bg-[var(--color-error)]/20 text-[var(--color-error)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
