import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "default" | "glass" | "gradient" | "premium";
  animate?: boolean;
  onClick?: () => void;
}

const Card = ({
  children,
  className = "",
  hover = false,
  variant = "default",
  animate = false,
  onClick,
}: CardProps) => {
  const variants = {
    default: `
      bg-[var(--color-bg-elevated)]
      border border-[var(--color-border)]
    `,
    glass: `
      glass-card
    `,
    gradient: `
      bg-[var(--color-bg-elevated)]
      gradient-border
    `,
    premium: `
      glass-premium
    `,
  };

  const hoverEffects = hover
    ? {
        whileHover: {
          y: -8,
          boxShadow:
            "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.15)",
          borderColor: "rgba(59, 130, 246, 0.3)",
        },
        transition: { duration: 0.3 },
      }
    : {};

  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <motion.div
      {...hoverEffects}
      {...animateProps}
      onClick={onClick}
      className={`
        ${variants[variant]}
        rounded-lg overflow-hidden
        transition-all duration-300
        ${hover ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

Card.Header = ({ children, className = "" }: CardHeaderProps) => (
  <div
    className={`px-6 py-5 border-b border-[var(--color-border)]/50 ${className}`}
  >
    {children}
  </div>
);

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

Card.Body = ({ children, className = "" }: CardBodyProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

Card.Footer = ({ children, className = "" }: CardFooterProps) => (
  <div
    className={`px-6 py-5 border-t border-[var(--color-border)]/50 ${className}`}
  >
    {children}
  </div>
);

export default Card;
