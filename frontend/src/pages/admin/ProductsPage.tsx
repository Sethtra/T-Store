import { useState } from "react";
import { motion } from "framer-motion";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
} from "../../hooks/useProducts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts({ page, limit: 10 });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: parseInt(formData.category_id),
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        data: productData,
      });
    } else {
      await createProduct.mutateAsync(productData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Products Management</h1>
            <p className="text-[var(--color-text-muted)]">
              {productsData?.meta.total || 0} products total
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                    Product
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                    Price
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                    Stock
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--color-border)]"
                    >
                      <td className="p-4">
                        <div className="h-10 w-48 skeleton rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 w-16 skeleton rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 w-12 skeleton rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 w-20 skeleton rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-8 w-24 skeleton rounded" />
                      </td>
                    </tr>
                  ))
                ) : productsData?.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-[var(--color-text-muted)]"
                    >
                      No products found. Create your first product!
                    </td>
                  </tr>
                ) : (
                  productsData?.data.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-surface)] overflow-hidden">
                            <img
                              src={product.images[0] || "/placeholder.jpg"}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4">
                        <Badge
                          variant={product.stock > 0 ? "success" : "error"}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-[var(--color-error)]"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {productsData && productsData.meta.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Page {productsData.meta.current_page} of{" "}
                {productsData.meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === productsData.meta.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-6">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={
                      createProduct.isPending || updateProduct.isPending
                    }
                  >
                    {editingProduct ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
