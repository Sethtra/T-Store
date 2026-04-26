import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../components/ui/Toast";
import AdminLayout from "../../components/admin/AdminLayout";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import {
  useAdminLandingSections,
  useCreateLandingSection,
  useUpdateLandingSection,
  useDeleteLandingSection,
  type LandingSection,
  type LandingSectionFormData,
} from "../../hooks/useLandingSections";
import { useProducts, type Product } from "../../hooks/useProducts";
import imageCompression from "browser-image-compression";

const LandingSectionPage = () => {
  const { showToast } = useToast();
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
    title_kh: "",
    description: "",
    description_kh: "",
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
    curated_excellence: {
      title: "Section 3 Card",
      description: "Gallery card in the horizontal scrolling section",
    },
  };

  const openCreateModal = (
    sectionType:
      | "hero_main"
      | "hero_featured"
      | "hero_small"
      | "curated_excellence",
  ) => {
    const existingSection =
      sectionType !== "curated_excellence"
        ? sections?.find((s) => s.section_type === sectionType)
        : null;

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
        title_kh: "",
        description: "",
        description_kh: "",
        title_color: "",
        description_color: "",
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
      title_kh: section.title_kh || "",
      description: section.description || "",
      description_kh: section.description_kh || "",
      title_color: section.title_color || "",
      description_color: section.description_color || "",
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
      if (formData.title_kh) submitData.append("title_kh", formData.title_kh);
      if (formData.description)
        submitData.append("description", formData.description);
      if (formData.description_kh)
        submitData.append("description_kh", formData.description_kh);
      if (formData.title_color) submitData.append("title_color", formData.title_color);
      if (formData.description_color) submitData.append("description_color", formData.description_color);
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

  const getCuratedExcellenceSections = () => {
    return (
      sections
        ?.filter((s) => s.section_type === "curated_excellence")
        ?.sort((a, b) => a.order - b.order) || []
    );
  };

  const getSelectedProduct = () => {
    return products.find((p) => p.id === formData.product_id);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full px-4 lg:px-8 py-4 lg:py-6 space-y-6">
          <div>
            <Skeleton variant="text" width="300px" height="32px" />
            <Skeleton
              variant="text"
              width="400px"
              height="20px"
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Skeleton variant="rounded" className="w-full h-[500px]" />
            <Skeleton variant="rounded" className="w-full h-[500px]" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full px-4 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </span>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Landing Section
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-2xl">
            Customize your storefront's hero experience. Update text, featured
            products, and banners to capture your customers' attention.
          </p>
        </div>

        {/* Hero Title Configuration */}
        <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden mb-10">
          <div className="p-6 md:p-8 bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent border-b border-[var(--color-border)]">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[var(--color-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Hero Section Messaging
            </h3>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Main Title
                  </label>
                  <input
                    type="text"
                    defaultValue={
                      localStorage.getItem("hero_title") ||
                      "Elevate your lifestyle"
                    }
                    id="hero-title-input"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    placeholder="e.g. Next-Gen Electronics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    defaultValue={
                      localStorage.getItem("hero_subtitle") ||
                      "with premium essentials."
                    }
                    id="hero-subtitle-input"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    placeholder="e.g. Discover the future today"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary)] mb-2">
                    Main Title (Khmer)
                  </label>
                  <input
                    type="text"
                    defaultValue={
                      localStorage.getItem("hero_title_kh") ||
                      "លើកកម្ពស់របៀបរស់នៅរបស់អ្នក"
                    }
                    id="hero-title-kh-input"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary)] mb-2">
                    Subtitle (Khmer)
                  </label>
                  <input
                    type="text"
                    defaultValue={
                      localStorage.getItem("hero_subtitle_kh") ||
                      "ជាមួយនឹងរបស់របរចាំបាច់លំដាប់ខ្ពស់"
                    }
                    id="hero-subtitle-kh-input"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    placeholder="បញ្ចូលចំណងជើងរងជាភាសាខ្មែរ..."
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Captivating Description
                  </label>
                  <textarea
                    defaultValue={
                      localStorage.getItem("hero_description") ||
                      "Elevate your routine with premium goods and curated essentials..."
                    }
                    id="hero-description-input"
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
                    placeholder="Tell your story in English..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary)] mb-2">
                    Description (Khmer)
                  </label>
                  <textarea
                    defaultValue={
                      localStorage.getItem("hero_description_kh") ||
                      "បង្កើនទម្លាប់របស់អ្នកជាមួយនឹងទំនិញលំដាប់ខ្ពស់..."
                    }
                    id="hero-description-kh-input"
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
                    placeholder="រៀបរាប់ជាភាសាខ្មែរ..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border)]">
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <svg
                  className="w-5 h-5 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium">
                  Changes apply instantly to the storefront homepage.
                </span>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  const title = (
                    document.getElementById(
                      "hero-title-input",
                    ) as HTMLInputElement
                  )?.value;
                  const titleKh = (
                    document.getElementById(
                      "hero-title-kh-input",
                    ) as HTMLInputElement
                  )?.value;
                  const subtitle = (
                    document.getElementById(
                      "hero-subtitle-input",
                    ) as HTMLInputElement
                  )?.value;
                  const subtitleKh = (
                    document.getElementById(
                      "hero-subtitle-kh-input",
                    ) as HTMLInputElement
                  )?.value;
                  const description = (
                    document.getElementById(
                      "hero-description-input",
                    ) as HTMLTextAreaElement
                  )?.value;
                  const descriptionKh = (
                    document.getElementById(
                      "hero-description-kh-input",
                    ) as HTMLTextAreaElement
                  )?.value;

                  if (title !== undefined)
                    localStorage.setItem("hero_title", title);
                  if (titleKh !== undefined)
                    localStorage.setItem("hero_title_kh", titleKh);
                  if (subtitle !== undefined)
                    localStorage.setItem("hero_subtitle", subtitle);
                  if (subtitleKh !== undefined)
                    localStorage.setItem("hero_subtitle_kh", subtitleKh);
                  if (description !== undefined)
                    localStorage.setItem("hero_description", description);
                  if (descriptionKh !== undefined)
                    localStorage.setItem("hero_description_kh", descriptionKh);
                  showToast("Hero text updated successfully!", "success");
                }}
                className="w-full sm:w-auto px-8"
              >
                Save Messaging
              </Button>
            </div>
          </div>
        </div>

        {/* Section Cards - Bento Style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Featured Product Card */}
          <div className="group bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] text-lg">
                  {sectionTypeLabels.hero_main.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {sectionTypeLabels.hero_main.description}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Primary Card
              </span>
            </div>

            <div className="p-6">
              {getSectionByType("hero_main") ? (
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center group-hover:bg-[var(--color-bg-surface)] transition-colors">
                    <img
                      src={
                        getSectionByType("hero_main")?.product?.image_url ||
                        "/placeholder.png"
                      }
                      alt={getSectionByType("hero_main")?.title}
                      className="max-h-[80%] w-auto object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white uppercase opacity-80 mb-0.5">
                          Currently Featured
                        </p>
                        <h4 className="font-bold text-white truncate">
                          {getSectionByType("hero_main")?.title}
                        </h4>
                      </div>
                      <p className="font-black text-white text-lg">
                        ${getSectionByType("hero_main")?.product?.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => openCreateModal("hero_main")}
                      variant="outline"
                      className="flex-1 border-dashed hover:border-solid"
                    >
                      Change Product
                    </Button>
                    <button
                      onClick={() =>
                        handleDelete(getSectionByType("hero_main")!.id)
                      }
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                      title="Remove from Hero"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyProductSlot onAdd={() => openCreateModal("hero_main")} />
              )}
            </div>
          </div>

          {/* Small Featured Product Card */}
          <div className="group bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] text-lg">
                  {sectionTypeLabels.hero_small.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {sectionTypeLabels.hero_small.description}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Secondary Row
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center">
              {getSectionByType("hero_small") ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] group-hover:bg-[var(--color-bg-surface)] transition-colors">
                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
                      <img
                        src={
                          getSectionByType("hero_small")?.product?.image_url ||
                          "/placeholder.png"
                        }
                        alt={getSectionByType("hero_small")?.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[var(--color-text-primary)] truncate">
                        {getSectionByType("hero_small")?.title}
                      </h4>
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-1">
                        {getSectionByType("hero_small")?.description}
                      </p>
                      <p className="text-xl font-black text-[var(--color-primary)] mt-2">
                        ${getSectionByType("hero_small")?.product?.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => openCreateModal("hero_small")}
                      variant="outline"
                      className="flex-1 border-dashed hover:border-solid"
                    >
                      Change Product
                    </Button>
                    <button
                      onClick={() =>
                        handleDelete(getSectionByType("hero_small")!.id)
                      }
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyProductSlot onAdd={() => openCreateModal("hero_small")} />
              )}
            </div>
          </div>
        </div>

        {/* Section 3 - Horizontal Gallery Editor */}
        <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden mt-10">
          <div className="p-6 md:p-8 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[var(--color-text-primary)] text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[var(--color-primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Section 3
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Manage the horizontal scrolling gallery cards on the homepage.
                Link cards to products.
              </p>
            </div>
            <Button
              onClick={() => openCreateModal("curated_excellence")}
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              Add Card
            </Button>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCuratedExcellenceSections().map((section) => (
                <div
                  key={section.id}
                  className="group relative bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-[4/3] relative bg-black">
                    <img
                      src={
                        section.custom_image
                          ? section.custom_image.startsWith("http")
                            ? section.custom_image
                            : `${import.meta.env.VITE_API_URL?.replace("/api", "")}/storage/${section.custom_image}`
                          : section.product?.image_url || "/placeholder.jpg"
                      }
                      alt={section.title || section.product?.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">
                        {section.description || section.product?.category}
                      </p>
                      <h4 className="text-white font-black text-xl truncate">
                        {section.title || section.product?.title}
                      </h4>
                    </div>
                  </div>
                  <div className="p-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEditModal(section)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-[var(--color-border)]"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {getCuratedExcellenceSections().length === 0 && (
                <div className="col-span-full">
                  <EmptyProductSlot
                    onAdd={() => openCreateModal("curated_excellence")}
                  />
                </div>
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

                {/* Custom Title & Description (English) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Custom Title (EN)
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
                        getSelectedProduct()?.title || "Enter title..."
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                      Custom Title (KH)
                      <span className="text-[var(--color-text-muted)] font-normal ml-2">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.title_kh}
                      onChange={(e) =>
                        setFormData({ ...formData, title_kh: e.target.value })
                      }
                      placeholder="បញ្ចូលចំណងជើងខ្មែរ..."
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {/* Custom Description (English & Khmer) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Description (EN)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="English description..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                      Description (KH)
                    </label>
                    <textarea
                      value={formData.description_kh}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description_kh: e.target.value,
                        })
                      }
                      placeholder="ការរៀបរាប់ខ្មែរ..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                    />
                  </div>
                </div>

                {/* Text Color Pickers - Only for Section 3 */}
                {formData.section_type === "curated_excellence" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Title Color
                        <span className="text-[var(--color-text-muted)] font-normal ml-2">(Optional)</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.title_color || "#1a1a2e"}
                          onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
                          className="w-12 h-12 rounded-xl border border-[var(--color-border)] cursor-pointer p-1 bg-[var(--color-bg-primary)]"
                        />
                        <input
                          type="text"
                          value={formData.title_color || ""}
                          onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
                          placeholder="e.g. #ffffff"
                          className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono text-sm"
                        />
                        {formData.title_color && (
                          <button type="button" onClick={() => setFormData({ ...formData, title_color: "" })} className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors">Reset</button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Subtitle Color
                        <span className="text-[var(--color-text-muted)] font-normal ml-2">(Optional)</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.description_color || "#6366f1"}
                          onChange={(e) => setFormData({ ...formData, description_color: e.target.value })}
                          className="w-12 h-12 rounded-xl border border-[var(--color-border)] cursor-pointer p-1 bg-[var(--color-bg-primary)]"
                        />
                        <input
                          type="text"
                          value={formData.description_color || ""}
                          onChange={(e) => setFormData({ ...formData, description_color: e.target.value })}
                          placeholder="e.g. #6366f1"
                          className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono text-sm"
                        />
                        {formData.description_color && (
                          <button type="button" onClick={() => setFormData({ ...formData, description_color: "" })} className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors">Reset</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const options = {
                                maxSizeMB: 1,
                                maxWidthOrHeight: 1200,
                                useWebWorker: true,
                                fileType: "image/webp",
                              };
                              const compressedFile = await imageCompression(
                                file,
                                options,
                              );
                              // Convert back to File object to maintain consistency
                              const newFile = new File(
                                [compressedFile],
                                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                                {
                                  type: "image/webp",
                                },
                              );
                              setSelectedImage(newFile);
                              setImagePreview(URL.createObjectURL(newFile));
                            } catch (error) {
                              console.error("Error compressing image:", error);
                              showToast(
                                "Failed to compress image. Please try another one.",
                                "error",
                              );
                            }
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

const EmptyProductSlot = ({ onAdd }: { onAdd: () => void }) => (
  <button
    onClick={onAdd}
    className="w-full h-full min-h-[300px] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-300 cursor-pointer group"
  >
    <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] shadow-sm border border-[var(--color-border)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <svg
        className="w-8 h-8 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-opacity"
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
    <h4 className="text-[var(--color-text-primary)] font-bold text-lg mb-1">
      Feature a Product
    </h4>
    <p className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
      Click to browse catalog
    </p>
  </button>
);

export default LandingSectionPage;
