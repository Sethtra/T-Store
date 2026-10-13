import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  /** Older variants map to the single bordered surface. */
  variant?: "default" | "glass" | "gradient" | "premium";
  /** @deprecated kept for API compatibility */
  animate?: boolean;
  onClick?: () => void;
}

const Card = ({ children, className = "", hover = false, onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden ${
      hover
        ? "cursor-pointer transition-[border-color,box-shadow] duration-200 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-md)]"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);

interface SlotProps {
  children: ReactNode;
  className?: string;
}

Card.Header = ({ children, className = "" }: SlotProps) => (
  <div className={`px-6 py-5 border-b border-[var(--color-border)] ${className}`}>{children}</div>
);

Card.Body = ({ children, className = "" }: SlotProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = "" }: SlotProps) => (
  <div className={`px-6 py-5 border-t border-[var(--color-border)] ${className}`}>{children}</div>
);

export default Card;
