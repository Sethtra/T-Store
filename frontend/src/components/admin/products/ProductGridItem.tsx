import { type Product } from "../../../hooks/useProducts";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

interface ProductGridItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductGridItem = ({
  product,
  onEdit,
  onDelete,
}: ProductGridItemProps) => {
  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-hidden group hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-[4/3] relative overflow-hidden bg-[var(--color-bg-surface)]">
        <img
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge
            variant={product.stock > 0 ? "success" : "error"}
            className="shadow-sm backdrop-blur-md bg-opacity-90"
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
          </Badge>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[1px]">
          <Button
            size="sm"
            onClick={() => onEdit(product)}
            className="bg-white text-black hover:bg-white/90 border-none transform scale-95 hover:scale-100 transition-transform"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(product.id)}
            className="transform scale-95 hover:scale-100 transition-transform"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3
            className="font-semibold text-lg line-clamp-1 text-[var(--color-text-primary)]"
            title={product.title}
          >
            {product.title}
          </h3>
          <span className="font-bold text-[var(--color-primary)]">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4 h-8">
          {product.description || "No description available"}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <span>ID: #{product.id}</span>
          <span>{new Date(product.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductGridItem;
