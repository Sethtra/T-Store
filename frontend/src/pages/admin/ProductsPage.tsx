import { useState } from "react";
import { motion } from "framer-motion";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
} from "../../hooks/useProducts";
import { useAdminCategories } from "../../hooks/useCategories";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts({ page, limit: 10 });
  const { data: categories } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // Track existing images for removal

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    attributes: {} as Record<string, string | string[]>,
  });

  // State for the Parent Category dropdown
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image_url: "",
      attributes: {},
    });
    setSelectedParentId("");
    setSelectedImages([]);
    setExistingImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    // Determine parent ID to pre-fill the first dropdown
    let parentId = "";
    if (product.category_id && categories) {
      for (const parent of categories) {
        // If the product belongs directly to a parent category (rare but possible)
        if (parent.id === product.category_id) {
          parentId = parent.id.toString();
          break;
        }
        // If the product belongs to a subcategory
        if (parent.children) {
          const child = parent.children.find(
            (c) => c.id === product.category_id,
          );
          if (child) {
            parentId = parent.id.toString();
            break;
          }
        }
      }
    }

    setFormData({
      title: product.title,
      description: product.description,
      price: product.price?.toString() || "0",
      stock: product.stock?.toString() || "0",
      category_id: product.category_id?.toString() || "",
      image_url: product.images?.[0] || "",
      attributes: product.attributes || {},
    });
    setSelectedParentId(parentId);

    setSelectedImages([]);
    setExistingImages(product.images || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedImages.length > 0) {
        // Use FormData for file upload when there are new files
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        if (formData.category_id) {
          data.append("category_id", formData.category_id);
        }

        // Send existing images that weren't removed
        if (existingImages.length > 0) {
          data.append("existing_images", JSON.stringify(existingImages));
        } else if (editingProduct) {
          // Explicitly send empty array if all existing images were removed
          data.append("existing_images", JSON.stringify([]));
        }

        // Append all selected files
        selectedImages.forEach((file) => {
          data.append("images[]", file);
        });

        // Add attributes
        if (
          formData.attributes &&
          Object.keys(formData.attributes).length > 0
        ) {
          data.append("attributes", JSON.stringify(formData.attributes));
        }

        if (editingProduct) {
          data.append("_method", "PUT");
          await updateProduct.mutateAsync({
            id: editingProduct.id,
            data: data as any,
          });
        } else {
          await createProduct.mutateAsync(data as any);
        }
      } else {
        // JSON payload (no new file uploads)
        const productData = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category_id: formData.category_id
            ? parseInt(formData.category_id)
            : null,
          // Send existing images (which respects any removals)
          images: existingImages,
          attributes: Object.fromEntries(
            Object.entries(formData.attributes).map(([key, value]) => {
              // Convert comma-separated strings to arrays
              if (typeof value === "string" && value.includes(",")) {
                return [
                  key,
                  value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                ];
              }
              return [key, value];
            }),
          ),
        };

        if (editingProduct) {
          await updateProduct.mutateAsync({
            id: editingProduct.id,
            data: productData,
          });
        } else {
          await createProduct.mutateAsync(productData);
        }
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save product:", error);
      const message =
        error.response?.data?.message ||
        "Failed to save product. Please try again.";
      alert(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert(
          "Failed to delete product. It might be linked to existing orders.",
        );
      }
    }
  };

  // Get available subcategories based on selected parent
  const subcategories =
    categories?.find((c) => c.id.toString() === selectedParentId)?.children ||
    [];

  return (
    <AdminLayout>
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
              className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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

                <div className="space-y-4">
                  {/* Category Selection (Parent) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                      value={selectedParentId}
                      onChange={(e) => {
                        setSelectedParentId(e.target.value);
                        setFormData({ ...formData, category_id: "" });
                      }}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Type Selection (Subcategory) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                      Product Type
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      disabled={!selectedParentId}
                      required
                    >
                      <option value="">Select Type</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                      {selectedParentId && subcategories.length === 0 && (
                        <option value="" disabled>
                          No types available
                        </option>
                      )}
                    </select>
                  </div>
                </div>

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

                {/* Attributes Section */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Attributes (Color, Size, Material)
                  </label>
                  <div className="space-y-3">
                    {Object.entries(formData.attributes || {}).map(
                      ([key, value], index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            placeholder="Name (e.g. Color)"
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            value={key}
                            onChange={(e) => {
                              const newAttributes = { ...formData.attributes };
                              const oldKey = Object.keys(newAttributes)[index];
                              const newVal = newAttributes[oldKey];
                              delete newAttributes[oldKey];
                              newAttributes[e.target.value] = newVal;
                              setFormData({
                                ...formData,
                                attributes: newAttributes,
                              });
                            }}
                          />
                          <input
                            placeholder="Value (e.g. Red, Blue)"
                            className="flex-[2] min-w-0 px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            value={
                              Array.isArray(value) ? value.join(", ") : value
                            }
                            onChange={(e) => {
                              const newAttributes = { ...formData.attributes };
                              const val = e.target.value;
                              // Store as comma-separated string temporarily, or try to keep array?
                              // Let's store as string in input, but parse when saving/typing
                              // For simplicity here, let's keep it simple:
                              newAttributes[key] = val;
                              setFormData({
                                ...formData,
                                attributes: newAttributes,
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAttributes = { ...formData.attributes };
                              delete newAttributes[key];
                              setFormData({
                                ...formData,
                                attributes: newAttributes,
                              });
                            }}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ),
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          attributes: { ...formData.attributes, "": "" },
                        });
                      }}
                    >
                      + Add Attribute
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                    Product Images
                  </label>

                  {/* Image Gallery - Grid Layout with existing, new, and add button */}
                  <div className="flex flex-wrap gap-3">
                    {/* Existing Images with Remove Button */}
                    {existingImages.map((img, i) => (
                      <div
                        key={`existing-${i}`}
                        className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[var(--color-border)] group bg-[var(--color-bg-secondary)]"
                      >
                        <img
                          src={img}
                          alt={`Product ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingImages((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            );
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* New Staged Files with Remove Button */}
                    {selectedImages
                      .filter((file): file is File => file instanceof File)
                      .map((file, i) => {
                        // Create object URL safely
                        let previewUrl = "";
                        try {
                          previewUrl = URL.createObjectURL(file);
                        } catch {
                          console.error(
                            "Failed to create preview for file:",
                            file,
                          );
                          return null;
                        }

                        return (
                          <div
                            key={`new-${i}`}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-green-500 group bg-[var(--color-bg-secondary)]"
                          >
                            <img
                              src={previewUrl}
                              alt={`New ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImages((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                );
                              }}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                              title="Remove image"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] text-center py-0.5 font-medium">
                              NEW
                            </span>
                          </div>
                        );
                      })}

                    {/* Add Image Button - Same size as thumbnails */}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-elevated)] cursor-pointer flex flex-col items-center justify-center transition-all group">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
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
                      <span className="text-[10px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] mt-1">
                        Add
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            // Add single file to staged images
                            const file = e.target.files[0];
                            setSelectedImages((prev) => [...prev, file]);
                          }
                          // Clear input to allow re-uploading the same file
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Helper text */}
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    {existingImages.length + selectedImages.length} image(s)
                    total
                    {selectedImages.length > 0 &&
                      ` • ${selectedImages.length} new to upload`}
                  </p>
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
    </AdminLayout>
  );
};

export default ProductsPage;
