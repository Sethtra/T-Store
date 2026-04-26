import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLandingData, type Product } from "../hooks/useLandingData";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import Button from "../components/ui/Button";
import HeroSection from "../components/home/HeroSection";
import BrowseByCategories from "../components/home/BrowseByCategories";
import CuratedExcellence from "../components/home/CuratedExcellence";
import { useTranslation } from "react-i18next";

const BackgroundElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05], rotate: [0, 45, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[var(--color-primary)] blur-[120px]"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.1, 0.03], rotate: [0, -45, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute top-[40%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500 blur-[100px]"
    />
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.08, 0.03], rotate: [0, 90, 0] }}
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 right-[10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-primary)] blur-[100px]"
    />
  </div>
);

const HomePage = () => {
  const { t } = useTranslation();
  const { data: landingData, isLoading, error } = useLandingData();
  const products = landingData?.featured_products;

  return (
    <div className="space-y-12 pb-16 min-h-screen relative overflow-hidden bg-[var(--color-bg-base)]">
      <BackgroundElements />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* Featured Products */}
      <section
        id="featured-products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 relative z-10 my-8 md:my-16"
      >
        <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] bg-[var(--color-bg-elevated)]/40 backdrop-blur-3xl border border-[var(--color-border)]/50 p-6 sm:p-10 md:p-14 overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 md:mb-14"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  Top Picks
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                  {t("home.featured_title")}
                </h2>
                <p className="text-[var(--color-text-muted)] mt-2 md:mt-4 text-lg max-w-xl">
                  {t("home.featured_sub")}
                </p>
              </div>
              <Link to="/products" className="hidden sm:block shrink-0 group">
                <Button variant="outline" className="rounded-full px-6 py-2.5 text-sm font-bold hover:shadow-lg hover:shadow-[var(--color-primary)]/10 transition-all border-[var(--color-border)] hover:border-[var(--color-primary)]/50">
                  {t("home.view_all")}
                </Button>
              </Link>
            </motion.div>

            {error && (
              <div className="text-center py-12 bg-red-500/10 rounded-[2rem] border border-red-500/20">
                <p className="text-red-500 font-medium">
                  {t("home.failed_load")}
                </p>
              </div>
            )}

            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : products
                    ?.slice(0, 8)
                    .map((product: Product) => (
                      <motion.div
                        key={product.id}
                        variants={{
                          hidden: { opacity: 0, y: 30, scale: 0.95 },
                          show: { 
                            opacity: 1, 
                            y: 0, 
                            scale: 1, 
                            transition: { type: "spring", stiffness: 100, damping: 15 } 
                          }
                        }}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      >
                        <ProductCard
                          id={product.id}
                          slug={product.slug}
                          title={product.title}
                          title_kh={product.title_kh}
                          price={product.price}
                          image={product.images?.[0] || "/placeholder.png"}
                          category={product.category?.name}
                          category_kh={product.category?.name_kh}
                          stock={product.stock}
                          description={product.description}
                          description_kh={product.description_kh}
                        />
                      </motion.div>
                    ))}
            </motion.div>
            
            <div className="mt-8 flex justify-center sm:hidden">
               <Link to="/products" className="w-full">
                 <Button variant="outline" fullWidth className="rounded-full py-3 text-sm font-bold hover:shadow-lg transition-all border-[var(--color-border)]">
                   {t("home.view_all")}
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Excellence Horizontal Gallery */}
      <CuratedExcellence />

      {/* Browse by Categories */}
      <div className="relative z-10">
        <BrowseByCategories />
      </div>

      {/* Features Section - Glassmorphic Redesign */}
      <section className="relative z-10 py-12 md:py-20 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: "🚀",
                title: t("home.shipping_title"),
                description: t("home.shipping_desc"),
                color: "var(--color-primary)"
              },
              {
                icon: "🛡️",
                title: t("home.secure_title"),
                description: t("home.secure_desc"),
                color: "#10B981"
              },
              {
                icon: "💬",
                title: t("home.support_title"),
                description: t("home.support_desc"),
                color: "#8B5CF6"
              },
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-8 rounded-[2.5rem] bg-[var(--color-bg-elevated)]/60 backdrop-blur-xl border border-[var(--color-border)]/50 shadow-xl overflow-hidden transition-all duration-300"
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: feature.color }} />
                
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center text-3xl mb-6 shadow-sm border border-[var(--color-border)]/50 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Glowing Design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] p-10 md:p-20 text-center bg-[var(--color-bg-elevated)]/80 backdrop-blur-2xl border border-[var(--color-border)]/60 shadow-2xl"
        >
          {/* Dynamic Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-gradient-to-r from-[var(--color-primary)]/20 via-purple-500/20 to-[var(--color-primary)]/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--color-primary)]/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-[var(--color-text-primary)] tracking-tight">
                {t("home.newsletter_title")}
              </h2>
              <p className="text-[var(--color-text-muted)] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                {t("home.newsletter_sub")}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
            >
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-purple-500 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                <input
                  type="email"
                  placeholder={t("home.enter_email")}
                  className="relative w-full px-6 py-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-transparent transition-all shadow-inner"
                />
              </div>
              <Button
                size="lg"
                className="py-4 px-8 rounded-2xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-purple-600 hover:from-[var(--color-primary-hover)] hover:to-purple-700 text-white shadow-xl shadow-[var(--color-primary)]/30 border-none transition-all hover:scale-105 active:scale-95"
              >
                {t("home.subscribe")}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
