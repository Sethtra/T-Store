import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories, type Category } from "../../hooks/useProducts";

const BrowseByCategories = () => {
  const { data: categories } = useCategories();

  // Get specific categories
  const getCategory = (preferredSlugs: string[]): Category | undefined => {
    for (const slug of preferredSlugs) {
      const found = categories?.find((c) => c.slug === slug);
      if (found) return found;
    }
    return undefined;
  };

  const displayCategory =
    getCategory(["electronics", "displays", "monitors"]) || categories?.[0];
  const headphonesCategory =
    getCategory(["headphones", "audio", "accessories"]) || categories?.[1];
  const phonesCategory =
    getCategory(["phones", "smartphones", "mobile", "clothing"]) ||
    categories?.[2];

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-normal text-[#1d1d1f] dark:text-white mb-4 tracking-tight">
            Browser by categories
          </h2>
          <p className="text-[#86868b] text-base max-w-[600px] mx-auto font-normal">
            Explore our diverse range of categories tailored to meet your
            specific needs and interests.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-6 lg:h-[600px]">
          {/* All Product - Left Card (Spans 2 rows, 2 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 lg:row-span-2"
          >
            <Link to="/products" className="group block h-full">
              <div className="relative h-full bg-[#FAFAFA] dark:bg-[#1c1c1e] rounded-[32px] p-6 flex flex-col transition-colors duration-300">
                {/* Image Container - White Box */}
                <div className="relative w-full flex-1 bg-white dark:bg-[#2c2c2e] rounded-[24px] overflow-hidden flex items-center justify-center p-8 mb-6 transition-colors duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
                    alt="Smart Watch"
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col items-start space-y-4 px-2 pb-2">
                  <div>
                    <h3 className="text-2xl font-medium text-[#1d1d1f] dark:text-white mb-2">
                      All Product
                    </h3>
                    <p className="text-[#86868b] text-sm leading-relaxed max-w-sm">
                      Discover endless possibilities with our All Products
                      category. Shop now for everything you need in one
                      convenient place.
                    </p>
                  </div>

                  {/* Button Group */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1d1d1f] dark:bg-white text-white dark:text-black rounded-full text-sm font-medium transition-colors">
                      Browse All Products
                    </span>
                    <span className="w-[46px] h-[46px] flex items-center justify-center bg-[#1d1d1f] dark:bg-white text-white dark:text-black rounded-full transition-colors group-hover:rotate-45 duration-300">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M17 7H7M17 7V17"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Displays - Top Right (Spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 lg:row-span-1"
          >
            <Link
              to={
                displayCategory
                  ? `/products?category=${displayCategory.slug}`
                  : "/products"
              }
              className="group block h-full"
            >
              <div className="relative h-full bg-[#FAFAFA] dark:bg-[#1c1c1e] rounded-[32px] p-6 flex flex-row gap-6 transition-colors duration-300">
                {/* Left Content */}
                <div className="flex-1 flex flex-col justify-center px-2">
                  <h3 className="text-xl font-medium text-[#1d1d1f] dark:text-white mb-2">
                    {displayCategory?.name || "Displays"}
                  </h3>
                  <p className="text-[#86868b] text-sm mb-6 leading-relaxed">
                    Experience crystal-clear clarity and vibrant visuals with
                    our {displayCategory?.name || "Displays"}.
                  </p>

                  {/* View More Button */}
                  <div className="flex items-center gap-3">
                    <span className="px-5 py-2.5 bg-white dark:bg-[#3bf] dark:bg-opacity-10 dark:text-white rounded-full text-xs font-semibold text-[#1d1d1f] shadow-sm">
                      View More
                    </span>
                    <span className="w-9 h-9 flex items-center justify-center bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-full shadow-sm group-hover:bg-[#1d1d1f] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M17 7H7M17 7V17"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Right Image Container - White Box */}
                <div className="w-[55%] bg-white dark:bg-[#2c2c2e] rounded-[24px] overflow-hidden flex items-center justify-center p-6 transition-colors duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"
                    alt={displayCategory?.name || "Display"}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Headphones - Bottom Left (1 col) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 lg:row-span-1"
          >
            <Link
              to={
                headphonesCategory
                  ? `/products?category=${headphonesCategory.slug}`
                  : "/products"
              }
              className="group block h-full"
            >
              <div className="relative h-full bg-[#FAFAFA] dark:bg-[#1c1c1e] rounded-[32px] p-6 flex flex-col transition-colors duration-300">
                {/* Top Image Container - White Box */}
                <div className="flex-1 bg-white dark:bg-[#2c2c2e] rounded-[24px] overflow-hidden flex items-center justify-center p-6 mb-4 transition-colors duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80"
                    alt={headphonesCategory?.name || "Headphones"}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="flex items-end justify-between px-1">
                  <div>
                    <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-white mb-1">
                      {headphonesCategory?.name || "Headphones"}
                    </h3>
                    <p className="text-[#86868b] text-[10px] sm:text-xs">
                      Premium sound & style
                    </p>
                  </div>
                  <span className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 17L17 7M17 7H7M17 7V17"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Phones - Bottom Right (1 col) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 lg:row-span-1"
          >
            <Link
              to={
                phonesCategory
                  ? `/products?category=${phonesCategory.slug}`
                  : "/products"
              }
              className="group block h-full"
            >
              <div className="relative h-full bg-[#FAFAFA] dark:bg-[#1c1c1e] rounded-[32px] p-6 flex flex-col transition-colors duration-300">
                {/* Top Image Container - White Box */}
                <div className="flex-1 bg-white dark:bg-[#2c2c2e] rounded-[24px] overflow-hidden flex items-center justify-center p-6 mb-4 transition-colors duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80"
                    alt={phonesCategory?.name || "Phones"}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="flex items-end justify-between px-1">
                  <div>
                    <h3 className="text-lg font-medium text-[#1d1d1f] dark:text-white mb-1">
                      {phonesCategory?.name || "Phones"}
                    </h3>
                    <p className="text-[#86868b] text-[10px] sm:text-xs">
                      Advanced technology
                    </p>
                  </div>
                  <span className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 17L17 7M17 7H7M17 7V17"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategories;
