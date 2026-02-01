import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useCategoryDisplays,
  type CategoryDisplay,
} from "../../hooks/useCategoryDisplays";

const BrowseByCategories = () => {
  const { data: displays, isLoading } = useCategoryDisplays();

  const getDisplay = (position: string): CategoryDisplay | undefined => {
    return displays?.find((d) => d.position === position);
  };

  const mainDisplay = getDisplay("main");
  const featuredDisplay = getDisplay("featured");
  const small1Display = getDisplay("small_1");
  const small2Display = getDisplay("small_2");

  const defaultImages: Record<string, string> = {
    main: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    featured:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    small_1:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
    small_2:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 w-full skeleton rounded-[32px]" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-[var(--color-bg-primary)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-medium text-[var(--color-text-primary)] tracking-tight mb-4">
              Browse by Categories
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] font-normal leading-relaxed">
              Explore our curated collections designed for your lifestyle.
            </p>
          </div>
          <Link
            to="/products"
            className="group flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors font-medium text-lg"
          >
            View all categories
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Modern Single-Surface Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-6 lg:h-[700px]">
          {/* Main Card */}
          {mainDisplay?.is_active !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-2 lg:row-span-2"
            >
              <Link
                to={mainDisplay?.link || "/products"}
                className="group block h-full"
              >
                <div className="relative h-full w-full bg-[var(--color-bg-surface)] rounded-[32px] overflow-hidden flex flex-col p-8 md:p-10 transition-all duration-300 hover:shadow-2xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)]">
                  {/* Background Gradient Blob - Shifted to avoid text overlap */}
                  <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl opacity-100" />

                  {/* Text Top-Left - High Z-Index */}
                  <div className="relative z-20 flex flex-col items-start gap-4 max-w-[60%]">
                    <div>
                      <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wide uppercase bg-[var(--color-bg-elevated)] rounded-full text-[var(--color-text-primary)] shadow-sm">
                        Premium Collection
                      </span>
                      <h3 className="text-4xl font-bold text-[var(--color-text-primary)] leading-tight">
                        {mainDisplay?.title || "All Products"}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)] font-medium leading-relaxed">
                        Discover the latest in technology and design.
                      </p>
                    </div>

                    {/* Redesigned Button - Clean & Sharp */}
                    <button className="mt-4 group/btn flex items-center justify-between gap-4 px-1 py-1 pr-6 bg-[var(--color-bg-elevated)] rounded-full shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all duration-300">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-text-primary)] flex items-center justify-center text-[var(--color-bg-primary)] group-hover/btn:scale-110 transition-transform">
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
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                        Shop Collection
                      </span>
                    </button>
                  </div>

                  {/* Image - Bottom Right (Better Fit) */}
                  <motion.div
                    className="absolute right-[-10%] bottom-[-10%] w-[80%] h-[80%] flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-orange-400/20 to-amber-300/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img
                      src={mainDisplay?.image_url || defaultImages.main}
                      alt={mainDisplay?.title}
                      className="relative z-10 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-2xl"
                    />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Featured Card (Wide) */}
          {featuredDisplay?.is_active !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-2 lg:row-span-1"
            >
              <Link
                to={featuredDisplay?.link || "/products"}
                className="group block h-full"
              >
                <div className="relative h-full w-full bg-[var(--color-bg-surface)] rounded-[32px] overflow-hidden flex flex-row items-center justify-between p-8 md:p-10 transition-all duration-300 hover:shadow-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)]">
                  {/* Background Gradient Blob */}
                  <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-400/10 to-blue-500/10 rounded-full blur-[80px]" />

                  <div className="z-10 flex flex-col items-start gap-3 max-w-[50%]">
                    <span className="text-xs font-bold tracking-wider uppercase text-[var(--color-primary)]">
                      Top Rated
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {featuredDisplay?.title || "Displays"}
                    </h3>
                    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed font-medium mb-2">
                      {featuredDisplay?.description || "Stunning visuals."}
                    </p>

                    {/* View Now Button */}
                    <div className="flex items-center gap-2 px-5 py-2 bg-[var(--color-bg-elevated)] rounded-full shadow-sm border border-[var(--color-border)] group-hover:shadow-md transition-all">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        View Now
                      </span>
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-[var(--color-primary)] transform group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="absolute right-[-20px] top-0 bottom-0 w-[55%] flex items-center justify-center p-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="absolute w-[70%] h-[70%] bg-blue-400/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={featuredDisplay?.image_url || defaultImages.featured}
                      alt={featuredDisplay?.title}
                      className="relative z-10 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-xl"
                    />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Small Card 1 */}
          {small1Display?.is_active !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-1 lg:row-span-1"
            >
              <Link
                to={small1Display?.link || "/products"}
                className="group block h-full"
              >
                <div className="relative h-full w-full bg-[var(--color-bg-surface)] rounded-[32px] overflow-hidden flex flex-col p-8 transition-all duration-300 hover:shadow-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-[40px]" />

                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] z-10 mb-1">
                    {small1Display?.title || "Headphones"}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium z-10">
                    New Arrival
                  </p>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pt-8"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="absolute w-[60%] h-[60%] bg-yellow-300/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={small1Display?.image_url || defaultImages.small_1}
                      alt={small1Display?.title}
                      className="relative z-10 w-[80%] h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-lg"
                    />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Small Card 2 */}
          {small2Display?.is_active !== false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-1 lg:row-span-1"
            >
              <Link
                to={small2Display?.link || "/products"}
                className="group block h-full"
              >
                <div className="relative h-full w-full bg-[var(--color-bg-surface)] rounded-[32px] overflow-hidden flex flex-col p-8 transition-all duration-300 hover:shadow-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)]">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-400/10 rounded-full blur-[40px]" />

                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] z-10 mb-1">
                    {small2Display?.title || "Phones"}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium z-10">
                    Best Sellers
                  </p>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pt-8"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="absolute w-[60%] h-[60%] bg-green-300/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={small2Display?.image_url || defaultImages.small_2}
                      alt={small2Display?.title}
                      className="relative z-10 w-[80%] h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-lg"
                    />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategories;
