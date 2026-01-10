import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  type Banner,
  type MainBanner,
  type SectionBanner,
} from "../../hooks/useBanners";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

type BannerType = "main" | "section";

const BannersPage = () => {
  // const [activeTab, setActiveTab] = useState<BannerType>("section"); // Removed unused state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [imageInputType, setImageInputType] = useState<"url" | "file">("url");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: bannersData, isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [formData, setFormData] = useState({
    type: "main" as BannerType,
    image_url: "",
    title: "",
    title_gradient: "",
    text_color: "#ffffff",
    tag: "",
    description: "",
    primary_button_text: "",
    primary_button_link: "",
    secondary_button_text: "",
    secondary_button_link: "",
    button_text: "",
    button_link: "",
    is_active: true,
    order: 0,
  });

  const openCreateModal = (type: BannerType) => {
    setEditingBanner(null);
    setFormData({
      type,
      image_url: "",
      title: "",
      title_gradient:
        type === "main" ? "linear-gradient(to right, #229DB0, #1e8b9b)" : "",
      text_color: "#ffffff",
      tag: "",
      description: "",
      primary_button_text: type === "main" ? "Shop Now" : "",
      primary_button_link: type === "main" ? "/products" : "",
      secondary_button_text: type === "main" ? "New Arrivals" : "",
      secondary_button_link: type === "main" ? "/products?sort=newest" : "",
      button_text: type === "section" ? "View Collection" : "",
      button_link: type === "section" ? "/products" : "",
      is_active: true,
      order: 0,
    });
    setImageInputType("url");
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      type: banner.type,
      image_url: banner.image || "",
      title: banner.title || "",
      title_gradient:
        banner.type === "main"
          ? (banner as MainBanner).title_gradient || ""
          : "",
      text_color: banner.text_color || "#ffffff",
      tag: banner.type === "main" ? (banner as MainBanner).tag || "" : "",
      description: banner.description || "",
      primary_button_text:
        banner.type === "main"
          ? (banner as MainBanner).primary_button_text || ""
          : "",
      primary_button_link:
        banner.type === "main"
          ? (banner as MainBanner).primary_button_link || ""
          : "",
      secondary_button_text:
        banner.type === "main"
          ? (banner as MainBanner).secondary_button_text || ""
          : "",
      secondary_button_link:
        banner.type === "main"
          ? (banner as MainBanner).secondary_button_link || ""
          : "",
      button_text:
        banner.type === "section"
          ? (banner as SectionBanner).button_text || ""
          : "",
      button_link:
        banner.type === "section"
          ? (banner as SectionBanner).button_link || ""
          : "",
      is_active: banner.is_active,
      order: banner.order,
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
        formDataToSend.append("type", formData.type);
        formDataToSend.append("image", selectedImage);
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("is_active", formData.is_active ? "1" : "0");
        formDataToSend.append("order", formData.order.toString());
        if (formData.text_color)
          formDataToSend.append("text_color", formData.text_color);

        if (formData.type === "main") {
          if (formData.title_gradient)
            formDataToSend.append("title_gradient", formData.title_gradient);
          if (formData.tag) formDataToSend.append("tag", formData.tag);
          if (formData.primary_button_text)
            formDataToSend.append(
              "primary_button_text",
              formData.primary_button_text
            );
          if (formData.primary_button_link)
            formDataToSend.append(
              "primary_button_link",
              formData.primary_button_link
            );
          if (formData.secondary_button_text)
            formDataToSend.append(
              "secondary_button_text",
              formData.secondary_button_text
            );
          if (formData.secondary_button_link)
            formDataToSend.append(
              "secondary_button_link",
              formData.secondary_button_link
            );
        } else {
          if (formData.button_text)
            formDataToSend.append("button_text", formData.button_text);
          if (formData.button_link)
            formDataToSend.append("button_link", formData.button_link);
        }

        if (editingBanner) {
          await updateBanner.mutateAsync({
            id: editingBanner.id,
            data: formDataToSend,
          });
        } else {
          await createBanner.mutateAsync(formDataToSend);
        }
      } else {
        const dataToSend: any = {
          type: formData.type,
          image_url: formData.image_url,
          title: formData.title,
          description: formData.description,
          is_active: formData.is_active,
          order: formData.order,
          text_color: formData.text_color,
        };

        if (formData.type === "main") {
          if (formData.title_gradient)
            dataToSend.title_gradient = formData.title_gradient;
          if (formData.tag) dataToSend.tag = formData.tag;
          if (formData.primary_button_text)
            dataToSend.primary_button_text = formData.primary_button_text;
          if (formData.primary_button_link)
            dataToSend.primary_button_link = formData.primary_button_link;
          if (formData.secondary_button_text)
            dataToSend.secondary_button_text = formData.secondary_button_text;
          if (formData.secondary_button_link)
            dataToSend.secondary_button_link = formData.secondary_button_link;
        } else {
          if (formData.button_text)
            dataToSend.button_text = formData.button_text;
          if (formData.button_link)
            dataToSend.button_link = formData.button_link;
        }

        if (editingBanner) {
          await updateBanner.mutateAsync({
            id: editingBanner.id,
            data: dataToSend,
          });
        } else {
          await createBanner.mutateAsync(dataToSend);
        }
      }

      setIsModalOpen(false);
      setSelectedImage(null);
    } catch (error: any) {
      console.error("Banner save error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Failed to save banner";
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const errorList = Object.entries(validationErrors)
          .map(
            ([field, messages]: [string, any]) =>
              `${field}: ${messages.join(", ")}`
          )
          .join("\n");
        alert(`Validation errors:\n${errorList}`);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await deleteBanner.mutateAsync(id);
    } catch (error) {
      alert("Failed to delete banner");
    }
  };

  const currentBanners = bannersData?.section || [];

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
            <h1 className="text-3xl font-bold">Manage Banners</h1>
          </div>
          <Button onClick={() => openCreateModal("section")}>
            Add Section Banner
          </Button>
        </div>

        {/* Tabs - REMOVED as per request to remove Main Banners */}
        {/* <div className="flex gap-4 mb-8 border-b border-[var(--color-border)]">
          ...
        </div> */}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Section Banners ({bannersData?.section?.length || 0})
          </h2>
          <p className="text-[var(--color-text-muted)]">
            Manage the rotating banners on the homepage.
          </p>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentBanners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {!banner.is_active && (
                    <div className="absolute top-2 right-2">
                      <Badge>Inactive</Badge>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{banner.title}</h3>
                    <Badge>Order: {banner.order}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
                    {banner.description}
                  </p>
                  {banner.type === "main" && (banner as MainBanner).tag && (
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                      {(banner as MainBanner).tag}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(banner)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
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
              className="bg-[var(--color-bg-elevated)] rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingBanner ? "Edit" : "Add"}{" "}
                {formData.type === "main" ? "Main" : "Section"} Banner
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
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
                      Upload
                    </button>
                  </div>

                  {imageInputType === "url" ? (
                    <Input
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="https://example.com/banner.jpg"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSelectedImage(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-hover)]"
                    />
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Premium Tech"
                    required
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-4">
                    <Input
                      type="color"
                      value={formData.text_color || "#ffffff"}
                      onChange={(e) =>
                        setFormData({ ...formData, text_color: e.target.value })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.text_color || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, text_color: e.target.value })
                      }
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Main Banner Specific Fields */}
                {formData.type === "main" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Title Gradient (CSS)
                      </label>
                      <Input
                        value={formData.title_gradient}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title_gradient: e.target.value,
                          })
                        }
                        placeholder="linear-gradient(to right, #00c6ff, #0072ff)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tag
                      </label>
                      <Input
                        value={formData.tag}
                        onChange={(e) =>
                          setFormData({ ...formData, tag: e.target.value })
                        }
                        placeholder="e.g., Featured Product"
                      />
                    </div>
                  </>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Banner description..."
                    rows={3}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  />
                </div>

                {/* Main Banner Buttons */}
                {formData.type === "main" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Button Text
                        </label>
                        <Input
                          value={formData.primary_button_text}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_button_text: e.target.value,
                            })
                          }
                          placeholder="Shop Now"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Button Link
                        </label>
                        <Input
                          value={formData.primary_button_link}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              primary_button_link: e.target.value,
                            })
                          }
                          placeholder="/products"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Secondary Button Text
                        </label>
                        <Input
                          value={formData.secondary_button_text}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_button_text: e.target.value,
                            })
                          }
                          placeholder="New Arrivals"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Secondary Button Link
                        </label>
                        <Input
                          value={formData.secondary_button_link}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              secondary_button_link: e.target.value,
                            })
                          }
                          placeholder="/products?sort=newest"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Section Banner Button */}
                {formData.type === "section" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Button Text
                      </label>
                      <Input
                        value={formData.button_text}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            button_text: e.target.value,
                          })
                        }
                        placeholder="View Collection"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Button Link
                      </label>
                      <Input
                        value={formData.button_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            button_link: e.target.value,
                          })
                        }
                        placeholder="/products?category=electronics"
                      />
                    </div>
                  </div>
                )}

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Order
                    </label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded accent-[var(--color-primary)]"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                {(formData.image_url || selectedImage) && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preview
                    </label>
                    <div className="h-48 rounded-lg overflow-hidden">
                      <img
                        src={
                          selectedImage
                            ? URL.createObjectURL(selectedImage)
                            : formData.image_url
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createBanner.isPending || updateBanner.isPending}
                    className="flex-1"
                  >
                    {createBanner.isPending || updateBanner.isPending
                      ? "Saving..."
                      : editingBanner
                      ? "Update Banner"
                      : "Create Banner"}
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

export default BannersPage;
