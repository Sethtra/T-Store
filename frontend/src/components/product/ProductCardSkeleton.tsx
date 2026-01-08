const ProductCardSkeleton = () => {
  return (
    <div className="bg-[var(--color-bg-elevated)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
      {/* Image Skeleton */}
      <div className="aspect-square skeleton" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-6 w-20 skeleton rounded" />
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
