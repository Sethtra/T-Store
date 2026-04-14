import Skeleton from "../ui/Skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-[var(--color-bg-elevated)] rounded-2xl overflow-hidden border border-[var(--color-border)] p-4 space-y-4">
      {/* Image Skeleton */}
      <Skeleton variant="rounded" className="w-full aspect-square" />

      {/* Content Skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="100%" />
        <div className="pt-2 flex justify-between items-center">
          <Skeleton variant="text" width="30%" height="24px" />
          <Skeleton variant="circle" width="36px" height="36px" />
        </div>
      </div>
    </div>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton = ({
  count = 8,
}: ProductGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
