import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({
  children,
  className = "",
  hover = false,
  onClick,
}: CardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "var(--shadow-lg)" } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        bg-[var(--color-bg-elevated)]
        border border-[var(--color-border)]
        rounded-xl overflow-hidden
        transition-colors duration-200
        ${
          hover ? "cursor-pointer hover:border-[var(--color-border-hover)]" : ""
        }
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
    className={`px-5 py-4 border-b border-[var(--color-border)] ${className}`}
  >
    {children}
  </div>
);

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

Card.Body = ({ children, className = "" }: CardBodyProps) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

Card.Footer = ({ children, className = "" }: CardFooterProps) => (
  <div
    className={`px-5 py-4 border-t border-[var(--color-border)] ${className}`}
  >
    {children}
  </div>
);

export default Card;
