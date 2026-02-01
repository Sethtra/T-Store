import { type Product } from "../../../hooks/useProducts";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductListItem = ({
  product,
  onEdit,
  onDelete,
}: ProductListItemProps) => {
  return (
    <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-200 group">
      <td className="p-4 pl-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-surface)] overflow-hidden border border-[var(--color-border)] flex-shrink-0">
            <img
              src={product.images[0] || "/placeholder.jpg"}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p
              className="font-medium text-[var(--color-text-primary)] truncate max-w-[200px]"
              title={product.title}
            >
              {product.title}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              ID: {product.id}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4 font-mono font-medium text-[var(--color-text-primary)]">
        ${Number(product.price).toFixed(2)}
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-sm">{product.stock} units</span>
          {product.stock < 10 && product.stock > 0 && (
            <span className="text-[10px] text-[var(--color-warning)]">
              Low Stock
            </span>
          )}
        </div>
      </td>
      <td className="p-4">
        <Badge variant={product.stock > 0 ? "success" : "error"}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </Badge>
      </td>
      <td className="p-4 pr-6">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            className="hover:bg-[var(--color-bg-surface)]"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ProductListItem;
