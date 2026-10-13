import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rectangle" | "rounded";
  animation?: "shimmer" | "pulse";
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangle",
  animation = "shimmer",
  width,
  height,
}) => {
  const baseClasses = "bg-[var(--color-bg-surface)] relative overflow-hidden";
  
  const variantClasses = {
    text: "h-3 w-full rounded-[4px]",
    circle: "rounded-full",
    rectangle: "",
    rounded: "rounded-[var(--radius-lg)]",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--color-bg-primary)]/60 before:to-transparent",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Layout Specific Skeletons
export const ProductCardSkeleton = () => (
  <div className="bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] space-y-4">
    <Skeleton variant="rounded" className="aspect-square w-full" />
    <div className="space-y-2 px-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" className="opacity-60" />
      <div className="pt-4 flex justify-between items-center">
        <Skeleton variant="text" width="30%" height="24px" />
        <Skeleton variant="circle" width="40px" height="40px" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <div className="flex items-center gap-4 p-4 border-b border-[var(--color-border)]">
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} variant="text" width={i === 0 ? "40%" : "15%"} height="20px" />
    ))}
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="bg-[var(--color-bg-elevated)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="text" width="120px" height="32px" />
      </div>
      <Skeleton variant="rounded" width="48px" height="48px" />
    </div>
    <Skeleton variant="text" width="60%" />
  </div>
);

export default Skeleton;
