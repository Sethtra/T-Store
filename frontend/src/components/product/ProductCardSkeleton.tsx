import Skeleton from "../ui/Skeleton";

const ProductCardSkeleton = () => (
  <div aria-hidden="true" className="overflow-hidden rounded-[12px] border border-[var(--color-card-edge)]">
    <Skeleton className="w-full aspect-[4/5]" />
    <div className="space-y-2 px-3 pb-3 pt-2.5">
      <Skeleton variant="text" width="30%" height="10px" />
      <div className="flex justify-between gap-3">
        <Skeleton variant="text" width="55%" height="14px" />
        <Skeleton variant="text" width="22%" height="14px" />
      </div>
      <Skeleton variant="text" width="25%" height="10px" />
    </div>
  </div>
);

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton = ({ count = 8 }: ProductGridSkeletonProps) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export default ProductCardSkeleton;
