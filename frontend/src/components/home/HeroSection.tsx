import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLandingData } from "../../hooks/useLandingData";
import { getImageUrl } from "../../utils/image";
import { useTranslation } from "react-i18next";
import { ArrowRight, Zap, ShoppingBag, Star } from "lucide-react";

const HeroSkeleton = () => (
  <section className="relative min-h-[85vh] flex items-center pt-32 pb-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="flex flex-col gap-6">
        <div className="w-32 h-8 rounded-full bg-[var(--color-bg-surface)] animate-pulse border border-[var(--color-border)]/50" />
        <div className="w-3/4 h-16 lg:h-20 rounded-2xl bg-[var(--color-bg-surface)] animate-pulse border border-[var(--color-border)]/50" />
        <div className="w-1/2 h-16 rounded-2xl bg-[var(--color-bg-surface)] animate-pulse border border-[var(--color-border)]/50" />
        <div className="w-full max-w-md h-24 rounded-2xl bg-[var(--color-bg-surface)] animate-pulse mt-4 border border-[var(--color-border)]/50" />
        <div className="flex gap-4 mt-4">
          <div className="w-40 h-14 rounded-full bg-[var(--color-bg-surface)] animate-pulse border border-[var(--color-border)]/50" />
          <div className="w-40 h-14 rounded-full bg-[var(--color-bg-surface)] animate-pulse border border-[var(--color-border)]/50" />
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-[var(--color-bg-surface)] animate-pulse border border-[var(--color-border)]/50" />
      </div>
    </div>
  </section>
);

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const { data: landingData, isLoading } = useLandingData();
  const sections = landingData?.landing_sections;

  const mainProduct = sections?.find(
    (s) => s.section_type === "hero_main" && s.product,
  );
  const p = mainProduct?.product;

  const isKh = i18n.language === "kh";
  const heroTitle = isKh
    ? localStorage.getItem("hero_title_kh") || t("hero.default_title")
    : localStorage.getItem("hero_title") || t("hero.default_title");

  const heroSubtitle = isKh
    ? localStorage.getItem("hero_subtitle_kh") || t("hero.default_subtitle")
    : localStorage.getItem("hero_subtitle") || t("hero.default_subtitle");

  const heroDescription = isKh
    ? localStorage.getItem("hero_description_kh") ||
      t("hero.default_description")
    : localStorage.getItem("hero_description") || t("hero.default_description");

  if (isLoading) return <HeroSkeleton />;

  const productTitle = p ? (isKh ? p.title_kh || p.title : p.title) : "";

  const productImage = getImageUrl(
    mainProduct?.custom_image || p?.image_url || p?.images?.[0]
  ) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000";

  return (
    <>
      <section className="relative z-10 pt-20 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-[85vh]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 space-y-8 z-10 w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-sm font-bold text-[var(--color-text)]">
              {isKh ? "ជំនាន់ថ្មីនៃពាណិជ្ជកម្ម" : "Next Gen E-Commerce"}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] text-[var(--color-text)]">
            {heroTitle} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-purple-500">
              {heroSubtitle}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-xl leading-relaxed font-light">
            {heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/products"
              style={{ color: "#000" }}
              className="group relative px-8 py-4 bg-white rounded-full font-bold text-lg overflow-hidden flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              {isKh ? "មេីលទាំងអស់" : "Shop Collection"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={p ? `/products/${p.slug}` : "/products"}
              style={{ color: "#fff" }}
              className="px-8 py-4 rounded-full border border-white/20 bg-transparent hover:bg-white/5 backdrop-blur-md font-bold text-lg flex items-center justify-center gap-2 transition-all hover:border-white/40"
            >
              <ShoppingBag className="w-5 h-5" />{" "}
              {isKh ? "ទិញឥឡូវនេះ" : "Buy Now"}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 relative w-full aspect-square max-w-[600px] z-10 mt-10 lg:mt-0"
        >
          {/* Massive blurred glow behind the product */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-purple-500/20 rounded-[3rem] blur-3xl pointer-events-none" />

          {p ? (
            <Link
              to={`/products/${p.slug}`}
              className="block relative w-full h-full z-10 group"
            >
              {/* Main Image Container */}
              <div className="w-full h-full rounded-[3rem] bg-[var(--color-bg-surface)]/50 backdrop-blur-xl border border-[var(--color-border)] flex items-center justify-center overflow-hidden shadow-2xl relative">
                <motion.img
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  src={productImage}
                  alt={productTitle}
                  className="w-[80%] h-[80%] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Floating Dynamic Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute top-10 -left-4 md:-left-10 bg-[var(--color-bg-surface)] backdrop-blur-2xl border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-4 z-20 shadow-2xl min-w-[200px]"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-widest mb-1 truncate">
                    {isKh ? "ទំនិញថ្មី" : "New Drop"}
                  </p>
                  <p className="font-black text-lg text-[var(--color-text)] truncate">
                    {productTitle}
                  </p>
                </div>
              </motion.div>
            </Link>
          ) : (
            <div className="w-full h-full rounded-[3rem] bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-2xl flex items-center justify-center text-[var(--color-text-muted)] relative z-10 backdrop-blur-xl">
              No featured product selected
            </div>
          )}
        </motion.div>
      </section>

      {/* Connected Marquee */}
      <div className="relative z-10 w-full py-8 bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex gap-16 px-8 items-center whitespace-nowrap"
        >
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex gap-16 items-center">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/40 uppercase tracking-widest">
                {isKh ? "គុណភាពល្អឥតខ្ចោះ" : "Premium Quality"}
              </span>
              <Star className="w-6 h-6 text-white/20" />
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/40 uppercase tracking-widest">
                {isKh ? "ដឹកជញ្ជូនរហ័ស" : "Fast Delivery"}
              </span>
              <Star className="w-6 h-6 text-white/20" />
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/40 uppercase tracking-widest">
                {isKh ? "ការទូទាត់សុវត្ថិភាព" : "Secure Checkout"}
              </span>
              <Star className="w-6 h-6 text-white/20" />
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default HeroSection;
