import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/useCategories";
import type { Category } from "../../hooks/useProducts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const CategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageInputType, setImageInputType] = useState<"url" | "file">("url");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formData, setFormData] = useState({
    name: "",
    banner_image_url: "",
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", banner_image_url: "" });
    setImageInputType("url");
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      banner_image_url: category.banner_image || "",
    });
    setImageInputType("url");
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (imageInputType === "file" && selectedImage) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("banner_image", selectedImage);

        if (editingCategory) {
          await updateCategory.mutateAsync({
            id: editingCategory.id,
            data: formDataToSend,
          });
        } else {
          await createCategory.mutateAsync(formDataToSend);
        }
      } else {
        const dataToSend: { name: string; banner_image_url?: string } = {
          name: formData.name,
        };

        if (formData.banner_image_url) {
          dataToSend.banner_image_url = formData.banner_image_url;
        }

        if (editingCategory) {
          await updateCategory.mutateAsync({
            id: editingCategory.id,
            data: dataToSend,
          });
        } else {
          await createCategory.mutateAsync(dataToSend);
        }
      }

      setIsModalOpen(false);
      setFormData({ name: "", banner_image_url: "" });
      setSelectedImage(null);
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to save category. Please try again."
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory.mutateAsync(id);
    } catch (error) {
      alert("Failed to delete category. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold">Manage Categories</h1>
          </div>
          <Button onClick={openCreateModal}>Add Category</Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                {category.banner_image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={category.banner_image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <Badge>{category.products_count || 0} products</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    Slug: {category.slug}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(category)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--color-bg-elevated)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Electronics"
                    required
                  />
                </div>

                {/* Image Input Toggle */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Banner Image
                  </label>
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setImageInputType("url")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        imageInputType === "url"
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputType("file")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        imageInputType === "file"
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {imageInputType === "url" ? (
                    <Input
                      value={formData.banner_image_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          banner_image_url: e.target.value,
                        })
                      }
                      placeholder="https://example.com/banner.jpg"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSelectedImage(e.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-hover)] transition-colors"
                      />
                      {selectedImage && (
                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                          Selected: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Preview */}
                {(formData.banner_image_url || selectedImage) && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preview
                    </label>
                    <div className="h-48 rounded-lg overflow-hidden bg-[var(--color-bg-surface)]">
                      <img
                        src={
                          selectedImage
                            ? URL.createObjectURL(selectedImage)
                            : formData.banner_image_url
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={
                      createCategory.isPending || updateCategory.isPending
                    }
                    className="flex-1"
                  >
                    {createCategory.isPending || updateCategory.isPending
                      ? "Saving..."
                      : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
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

export default CategoriesPage;
