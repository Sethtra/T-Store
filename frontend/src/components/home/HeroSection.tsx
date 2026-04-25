import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLandingData, type LandingSection } from "../../hooks/useLandingData";
import { getImageUrl } from "../../utils/image";
import { useTranslation } from "react-i18next";

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

// SmallProductCard has been removed

const MainProductDisplay = ({ mainProduct }: { mainProduct: LandingSection | undefined }) => {
  const { i18n } = useTranslation();
  
  if (!mainProduct?.product) {
     return (
       <div className="aspect-square w-full max-w-[500px] mx-auto rounded-[3rem] bg-[var(--color-bg-surface)]/50 border border-[var(--color-border)]/50 flex items-center justify-center text-[var(--color-text-muted)] backdrop-blur-sm">
         No featured product selected
       </div>
     );
  }

  const p = mainProduct.product;
  const title = i18n.language === "kh" ? p.title_kh || p.title : p.title;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative h-full min-h-[400px] lg:min-h-[600px] flex items-center justify-center mt-10 lg:mt-0"
    >
       {/* Background Glow specific to the product */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-[var(--color-primary)]/10 blur-[100px] pointer-events-none" />
       
       <Link to={`/products/${p.slug}`} className="relative block group w-full flex items-center justify-center">
         <motion.img 
           animate={{ y: [0, -15, 0] }}
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
           src={p.image_url || getImageUrl(p.images?.[0])}
           alt={title}
           className="w-[80%] lg:w-[90%] max-w-[600px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out z-10 relative"
         />
       </Link>
    </motion.div>
  );
};

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const { data: landingData, isLoading } = useLandingData();
  const sections = landingData?.landing_sections;

  const mainProduct = sections?.find((s) => s.section_type === "hero_main" && s.product);


  const isKh = i18n.language === "kh";
  const heroTitle = isKh
    ? localStorage.getItem("hero_title_kh") || t("hero.default_title")
    : localStorage.getItem("hero_title") || t("hero.default_title");

  const heroSubtitle = isKh
    ? localStorage.getItem("hero_subtitle_kh") || t("hero.default_subtitle")
    : localStorage.getItem("hero_subtitle") || t("hero.default_subtitle");

  const heroDescription = isKh
    ? localStorage.getItem("hero_description_kh") || t("hero.default_description")
    : localStorage.getItem("hero_description") || t("hero.default_description");

  if (isLoading) return <HeroSkeleton />;

  return (
    <section className="relative min-h-[85vh] flex items-center pt-32 pb-16 md:pt-44 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Content Area */}
        <div className="flex flex-col gap-6 lg:gap-8 lg:pr-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="flex flex-col gap-5 sm:gap-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-text-primary)]/[0.04] border border-[var(--color-text-primary)]/[0.1] text-[var(--color-text-primary)] text-xs sm:text-sm font-bold uppercase tracking-wider w-fit backdrop-blur-md">
               <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
               {isKh ? "ការប្រមូលថ្មី" : "NEW COLLECTION"}
            </div>
            
            {/* Main Headlines */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[var(--color-text-primary)] leading-[1.1] tracking-tight">
              <span className="inline-block whitespace-nowrap">{heroTitle}</span>
              <span className="block text-[var(--color-primary)] mt-2">{heroSubtitle}</span>
            </h1>
            
            <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-lg leading-relaxed font-normal">
              {heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Link 
                to="/products" 
                className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-[var(--color-text-primary)] bg-[var(--color-text-primary)]/[0.08] border border-[var(--color-text-primary)]/[0.12] hover:bg-[var(--color-text-primary)]/[0.12] transition-all backdrop-blur-md text-sm sm:text-base flex items-center justify-center active:scale-95 shadow-sm"
              >
                {isKh ? "ទិញឥឡូវនេះ" : "Shop Now"}
              </Link>
              <Link 
                to="/products" 
                className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-[var(--color-text-primary)] bg-transparent border border-[var(--color-text-primary)]/[0.12] hover:bg-[var(--color-text-primary)]/[0.04] transition-all backdrop-blur-md text-sm sm:text-base flex items-center justify-center active:scale-95"
              >
                {t("nav.categories", "Categories")}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Product Area */}
        <MainProductDisplay mainProduct={mainProduct} />
        
      </div>
    </section>
  );
};

export default HeroSection;
