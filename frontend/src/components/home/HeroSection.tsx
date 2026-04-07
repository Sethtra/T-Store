import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useLandingSections,
  type LandingSection,
} from "../../hooks/useLandingSections";

const HeroSection = () => {
  const { data: sections, isLoading } = useLandingSections();

  const mainProduct = sections?.find((s) => s.section_type === "hero_main" && s.product);
  const smallProduct = sections?.find((s) => s.section_type === "hero_small" && s.product);

  if (isLoading) {
    return (
      <section className="bg-white dark:bg-gray-950 transition-colors duration-300 p-10 min-h-screen font-sans flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-bg-primary)] transition-colors duration-300 px-4 md:px-8 font-sans pb-8 md:pb-12 flex flex-col items-center relative min-h-screen pt-24 md:pt-[140px]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 w-full">
        {/* Left Column - Single Grey Container */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl md:rounded-[3rem] p-6 md:p-14 flex flex-col justify-between relative overflow-hidden transition-colors duration-300 border border-[var(--color-border)]">
          {/* Top Content: Headings & Buttons */}
          <div className="space-y-8 z-10 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-[var(--color-text-primary)] leading-[1.1] tracking-tight">
                <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-2">
                  Elevate your lifestyle
                </span>
                <span className="block text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[var(--color-text-secondary)]">
                  with premium essentials.
                </span>
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm md:text-base leading-relaxed max-w-md mt-6 font-light">
                Elevate your routine with premium goods and curated essentials,
                combining quality and style to enhance comfort, convenience, and
                sophistication in every moment of your day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-4 pb-8"
            >
              <Link
                to="/products"
                className="bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-lg border border-[var(--color-border)]"
              >
                Browse All Products
              </Link>
              <Link
                to="/products"
                className="bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-lg border border-[var(--color-border)]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transform -rotate-45"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Bottom Content: Small Product Card (White) */}
          {smallProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <SmallProductCard product={smallProduct} />
            </motion.div>
          )}
        </div>

        {/* Right Column: Main Product (Grey) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="h-full"
        >
          {mainProduct ? (
            <MainProductCard product={mainProduct} />
          ) : (
            <div className="bg-[var(--color-bg-surface)] rounded-[2.5rem] p-12 h-full min-h-[600px] flex items-center justify-center transition-colors duration-300 border border-[var(--color-border)]" />
          )}
        </motion.div>
      </div>
    </section>
  );
};

// Main Product Card (Right Column)
const MainProductCard = ({ product }: { product: LandingSection }) => {
  return (
    <Link
      to={`/products/${product?.product?.slug || ""}`}
      className="bg-[var(--color-bg-surface)] rounded-2xl md:rounded-[2.5rem] relative h-full min-h-[350px] md:min-h-[600px] group block overflow-hidden transition-colors duration-300 border border-[var(--color-border)]"
    >
      {/* Featured Badge */}
      <span className="absolute top-8 left-8 z-20 bg-[var(--color-bg-elevated)] backdrop-blur-md text-[var(--color-text-primary)] text-[11px] uppercase font-bold tracking-wider px-4 py-2 rounded-full shadow-sm border border-[var(--color-border)]">
        Featured
      </span>

      {/* Product Image - Massive & Centered */}
      {product?.product?.image_url && (
        <div className="absolute inset-x-0 top-0 bottom-[120px] md:bottom-0 flex items-center justify-center p-6 md:p-0 overflow-hidden md:rounded-[2.5rem]">
          <img
            src={product.product.image_url}
            className="w-full h-full md:w-[110%] md:h-[110%] object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
            alt={product.title}
          />
        </div>
      )}

      {/* Bottom Info - Glass Effect */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 bg-[var(--color-bg-elevated)]/60 backdrop-blur-md border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-end justify-between gap-2 transition-colors duration-300">
        <div className="relative z-10">
          <h3 className="text-xl md:text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">
            {product.title}
          </h3>
          <p className="text-[var(--color-text-muted)] text-xs md:text-sm mt-1 md:mt-3 max-w-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>
        <p className="relative z-10 font-bold text-lg md:text-2xl text-[var(--color-text-primary)]">
          USD {product?.product?.price ?? "0.00"}
        </p>
      </div>
    </Link>
  );
};

// Small Product Card (Left Column Bottom)
const SmallProductCard = ({ product }: { product: LandingSection }) => {
  return (
    <Link
      to={`/products/${product?.product?.slug || ""}`}
      className="bg-[var(--color-bg-elevated)] rounded-xl md:rounded-[2rem] p-3 md:p-6 relative flex flex-row items-center sm:items-stretch gap-4 md:gap-6 group hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]"
    >
      <span className="absolute top-6 left-6 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full hidden sm:block">
        Featured
      </span>

      {/* Left Text Info */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-center sm:justify-between sm:pt-12 order-2 sm:order-1">
        <div>
          <h3 className="text-base sm:text-3xl font-bold text-[var(--color-text-primary)] truncate leading-tight">
            {product.title}
          </h3>
          <p className="text-[var(--color-text-muted)] text-xs md:text-sm mt-1 sm:mt-3 line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
        <p className="font-bold text-sm sm:text-xl text-[var(--color-text-primary)] mt-1 sm:mt-0">
          USD {product?.product?.price ?? "0.00"}
        </p>
      </div>

      {/* Right Image Container */}
      <div className="w-20 h-20 sm:w-52 sm:h-52 bg-[var(--color-bg-surface)] rounded-xl md:rounded-2xl flex items-center justify-center p-2 sm:p-4 transition-colors duration-300 order-1 sm:order-2 shrink-0">
        {product?.product?.image_url && (
          <img
            src={product.product.image_url}
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
            alt={product.title}
          />
        )}
      </div>
    </Link>
  );
};

export default HeroSection;
