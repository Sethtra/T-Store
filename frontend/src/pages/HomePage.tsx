import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useFeaturedProducts, type Product } from "../hooks/useProducts";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import Button from "../components/ui/Button";

const HomePage = () => {
  const { data: products, isLoading, error } = useFeaturedProducts();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-transparent to-purple-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="text-[var(--color-text-primary)]">
                Premium Tech
              </span>
              <br />
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-purple-500 bg-clip-text text-transparent">
                For Modern Life
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto"
            >
              Discover our curated collection of cutting-edge electronics,
              gadgets, and accessories designed to elevate your digital
              experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/products">
                <Button size="lg">Shop Now</Button>
              </Link>
              <Link to="/products?category=new">
                <Button variant="outline" size="lg">
                  New Arrivals
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              Handpicked products just for you
            </p>
          </div>
          <Link to="/products">
            <Button variant="ghost">View All →</Button>
          </Link>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-[var(--color-error)]">Failed to load products</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products
                ?.slice(0, 8)
                .map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    image={product.images?.[0] || "/placeholder.png"}
                    category={product.category?.name}
                  />
                ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Electronics", icon: "🔌", slug: "electronics" },
            { name: "Accessories", icon: "🎧", slug: "accessories" },
            { name: "Wearables", icon: "⌚", slug: "wearables" },
            { name: "Gaming", icon: "🎮", slug: "gaming" },
          ].map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="group"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 text-center transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-medium group-hover:text-[var(--color-primary)] transition-colors">
                  {category.name}
                </h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--color-bg-elevated)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                description: "On orders over $50",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                description: "100% protected transactions",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                description: "We're here to help",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-3xl p-8 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Subscribe to get special offers, free giveaways, and exclusive
            deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              variant="secondary"
              className="bg-white text-[var(--color-primary)] hover:bg-white/90"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
