import { useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import Button from "../../components/ui/Button";
import {
  useAdminLandingSections,
  useCreateLandingSection,
  useUpdateLandingSection,
  useDeleteLandingSection,
  type LandingSection,
  type LandingSectionFormData,
} from "../../hooks/useLandingSections";
import { useProducts, type Product } from "../../hooks/useProducts";

const LandingSectionPage = () => {
  const { data: sections, isLoading } = useAdminLandingSections();
  const { data: productsData } = useProducts({ limit: 100 });
  const createMutation = useCreateLandingSection();
  const updateMutation = useUpdateLandingSection();
  const deleteMutation = useDeleteLandingSection();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LandingSection | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<LandingSectionFormData>({
    section_type: "hero_main",
    product_id: 0,
    title: "",
    description: "",
    is_active: true,
    order: 0,
  });

  const products = productsData?.data || [];

  const sectionTypeLabels: Record<
    string,
    { title: string; description: string }
  > = {
    hero_main: {
      title: "Main Featured Product",
      description:
        "Large product card displayed on the right side of the hero section",
    },
    hero_small: {
      title: "Small Featured Product",
      description: "Smaller product card displayed below the CTA buttons",
    },
  };

  const openCreateModal = (
    sectionType: "hero_main" | "hero_featured" | "hero_small",
  ) => {
    const existingSection = sections?.find(
      (s) => s.section_type === sectionType,
    );
    if (existingSection) {
      openEditModal(existingSection);
    } else {
      setEditingSection(null);
      setSelectedImage(null);
      setImagePreview(null);
      setFormData({
        section_type: sectionType,
        product_id: products[0]?.id || 0,
        title: "",
        description: "",
        is_active: true,
        order: 0,
      });
      setIsModalOpen(true);
    }
  };

  const openEditModal = (section: LandingSection) => {
    setEditingSection(section);
    setSelectedImage(null);
    setImagePreview(section.custom_image || null);
    setFormData({
      section_type: section.section_type,
      product_id: section.product?.id || 0,
      title: section.title || "",
      description: section.description || "",
      is_active: true,
      order: section.order,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("section_type", formData.section_type);
      submitData.append("product_id", formData.product_id.toString());
      if (formData.title) submitData.append("title", formData.title);
      if (formData.description)
        submitData.append("description", formData.description);
      submitData.append("is_active", formData.is_active ? "1" : "0");
      submitData.append("order", formData.order?.toString() || "0");
      if (selectedImage) submitData.append("image", selectedImage);

      if (editingSection) {
        await updateMutation.mutateAsync({
          id: editingSection.id,
          formData: submitData,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      setIsModalOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error saving landing section:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this featured product?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getSectionByType = (type: string) => {
    return sections?.find((s) => s.section_type === type);
  };

  const getSelectedProduct = () => {
    return products.find((p) => p.id === formData.product_id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Landing Section
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Manage featured products displayed on the homepage hero section
          </p>
        </div>

        {/* Hero Title Configuration */}
        <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] p-6 mb-6">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">
            Hero Section Text
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Main Title
              </label>
              <input
                type="text"
                defaultValue="Elevate your lifestyle"
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Enter main title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Subtitle
              </label>
              <input
                type="text"
                defaultValue="with premium essentials."
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Enter subtitle..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Description
              </label>
              <textarea
                defaultValue="Elevate your routine with premium goods and curated essentials, combining quality and style to enhance comfort, convenience, and sophistication in every moment of your day."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                placeholder="Enter description..."
              />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            Note: To save these changes, hero text settings will be stored in
            browser. For permanent storage, contact developer to add database
            support.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Featured Product */}
          <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                {sectionTypeLabels.hero_main.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {sectionTypeLabels.hero_main.description}
              </p>
            </div>
            <div className="p-4">
              {getSectionByType("hero_main") ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-4 flex gap-4">
                    <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                      <img
                        src={
                          getSectionByType("hero_main")?.product?.image_url ||
                          "/placeholder.png"
                        }
                        alt={getSectionByType("hero_main")?.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {getSectionByType("hero_main")?.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {getSectionByType("hero_main")?.description}
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ${getSectionByType("hero_main")?.product?.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openCreateModal("hero_main")}
                      variant="outline"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() =>
                        handleDelete(getSectionByType("hero_main")!.id)
                      }
                      variant="outline"
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openCreateModal("hero_main")}
                  className="w-full py-12 border-2 border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-[var(--color-text-muted)]"
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
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    Click to add a featured product
                  </p>
                </button>
              )}
            </div>
          </div>

          {/* Small Featured Product */}
          <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                {sectionTypeLabels.hero_small.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {sectionTypeLabels.hero_small.description}
              </p>
            </div>
            <div className="p-4">
              {getSectionByType("hero_small") ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-4 flex gap-4">
                    <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                      <img
                        src={
                          getSectionByType("hero_small")?.product?.image_url ||
                          "/placeholder.png"
                        }
                        alt={getSectionByType("hero_small")?.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {getSectionByType("hero_small")?.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {getSectionByType("hero_small")?.description}
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ${getSectionByType("hero_small")?.product?.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openCreateModal("hero_small")}
                      variant="outline"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() =>
                        handleDelete(getSectionByType("hero_small")!.id)
                      }
                      variant="outline"
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openCreateModal("hero_small")}
                  className="w-full py-12 border-2 border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-[var(--color-text-muted)]"
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
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    Click to add a featured product
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-bg-elevated)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--color-border)]"
          >
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {editingSection ? "Edit" : "Add"} Featured Product
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {sectionTypeLabels[formData.section_type]?.title}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Select Product *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        product_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value={0}>Select a product...</option>
                    {products.map((product: Product) => (
                      <option key={product.id} value={product.id}>
                        {product.title} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Preview */}
                {formData.product_id > 0 && (
                  <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2">
                      <img
                        src={
                          getSelectedProduct()?.images?.[0] ||
                          "/placeholder.png"
                        }
                        alt="Product preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getSelectedProduct()?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${getSelectedProduct()?.price}
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Custom Title
                    <span className="text-[var(--color-text-muted)] font-normal ml-2">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={
                      getSelectedProduct()?.title || "Enter custom title..."
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                {/* Custom Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Custom Description
                    <span className="text-[var(--color-text-muted)] font-normal ml-2">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={
                      getSelectedProduct()?.description?.slice(0, 100) ||
                      "Enter custom description..."
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>

                {/* Custom Image */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Custom Image
                    <span className="text-[var(--color-text-muted)] font-normal ml-2">
                      (Optional - leave empty to use product image)
                    </span>
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedImage(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)]"
                      />
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        Supports: JPG, PNG, GIF, WebP. Max 5MB.
                      </p>
                    </div>
                    {(imagePreview || selectedImage) && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={imagePreview || ""}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--color-border)] flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.product_id ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default LandingSectionPage;
