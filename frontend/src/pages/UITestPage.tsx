/**
 * UITestPage — Faithful Implementation of Figma Design (Node 22-474 / MegaMart)
 * Connected to REAL Database Products (Read-Only)
 *
 * Rules & Skills Followed:
 *   - ui-ux-pro-max: High-density, professional e-commerce visual hierarchy.
 *   - frontend-ui-engineering: Platform-native, proper accessibility, high-contrast tokens.
 *   - Figma Node 22-474 Reference:
 *       1. Top utility micro-bar (location, delivery, phone).
 *       2. Main header with category-select search bar, account, wishlist, and cart badges.
 *       3. Horizontal category navigation with solid 'All Categories' pill button.
 *       4. Dark Midnight Navy Hero billboard card with 'SMART WEARABLE' & 'UP TO 40% OFF'.
 *       5. Quick circular category strip with circular avatar badges.
 *       6. 'Grab the Best Deal' product grid with discount badges, price savings, and 'Detail -->' link.
 *       7. 3-column promo banners strip.
 *       8. Full-bleed royal blue branded footer.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  Zap,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Cpu,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import BrowseByCategories from "../components/home/BrowseByCategories";
import { useProducts, useCategories, type Product } from "../hooks/useProducts";
import { getImageUrl } from "../utils/image";

// Real production database seed to ensure instantaneous hydration with 0 skeleton delays
const INITIAL_DB_PRODUCTS: Product[] = [
  {
    id: 18,
    title: "Xiao Mi 18 Pro Max",
    slug: "xiao-mi-18-pro-max",
    description: "Xiaomi 17 Pro Max is a high-end flagship smartphone designed to compete with top-tier devices like the iPhone 17 Pro Max and Samsung Galaxy S25 Ultra.",
    price: 1209,
    stock: 50,
    sold: 0,
    category_id: 4,
    category: { id: 4, name: "Phone", slug: "phone", name_kh: "ទូរស័ព្ទ" },
    images: [
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/gx2sVSoYb6TmlE2pY3mfD2k0u3krwwLmlvjIs8ma.webp",
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/agJnxPWQOHP7OkdEtxWgK51i7cv6VeG0o6ayXxrH.webp",
    ],
    attributes: {},
    created_at: "2026-04-25T19:38:21.000000Z",
    title_kh: "Xiao Mi 18 Pro Max",
    description_kh: "Xiaomi 17 Pro Max គឺជាទូរស័ព្ទទំនើបចុងក្រោយបង្អស់។",
  },
  {
    id: 19,
    title: "HeadPhone G56",
    slug: "headphone-g56",
    description: "Studio-grade acoustics with active noise cancellation, dual processors, and ultra-low latency.",
    price: 98,
    stock: 36,
    sold: 0,
    category_id: 6,
    category: { id: 6, name: "Audio", slug: "audio", name_kh: "កាសស្តាប់" },
    images: [
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/6Bg0ASEebcSr7BWwjfx05LVc7i5YVPWkX8JRgWF9.webp",
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/U3VYbmR7kCtgYnjabpNofmdEEJmPJSxbWCdVjjPH.webp",
    ],
    attributes: {},
    created_at: "2026-04-25T19:38:21.000000Z",
    title_kh: "HeadPhone G56",
    description_kh: "កាសស្តាប់កម្រិតស្ទូឌីយោ សម្លេងច្បាស់ល្អ។",
  },
  {
    id: 17,
    title: "OnePlus 15R Plus",
    slug: "oneplus-15r-plus",
    description: "Pro-tier flagship performance, 120Hz Fluid AMOLED display, Snapdragon processor, and super-fast charging.",
    price: 587,
    stock: 22,
    sold: 0,
    category_id: 4,
    category: { id: 4, name: "Phone", slug: "phone", name_kh: "ទូរស័ព្ទ" },
    images: [
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/szS0R0ZecI5wL8ckE0Wf8xYPexKKvAohFkweUlQB.webp",
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/teL1orDbvjTJe9Cv3klN5XWe4sgbm0iYI4sOVP3H.webp",
    ],
    attributes: {},
    created_at: "2026-04-25T19:38:21.000000Z",
    title_kh: "OnePlus 15R Plus",
    description_kh: "OnePlus 15R Plus កម្លាំងខ្លាំង រូបភាពច្បាស់ត្រជាក់ភ្នែក។",
  },
  {
    id: 16,
    title: "OnePlus Watch 5",
    slug: "oneplus-watch-5",
    description: "Smart AMOLED curved display, 100-hour battery life in smart mode, advanced sleep and fitness tracking.",
    price: 58,
    stock: 18,
    sold: 0,
    category_id: 5,
    category: { id: 5, name: "Watch", slug: "watch", name_kh: "នាឡិកា" },
    images: [
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/5iqEXP4N5xXat7JrfV5oyF7oEoqvORPoNCMdMrOA.webp",
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/cnSeLaA55mXpNsccWu3tEVlL7eXZEJh19uVWbso7.webp",
    ],
    attributes: {},
    created_at: "2026-04-25T19:38:21.000000Z",
    title_kh: "OnePlus Watch 5",
    description_kh: "នាឡិកាឆ្លាតវៃ OnePlus Watch 5 ថាមពលថ្មប្រើបានយូរ។",
  },
  {
    id: 14,
    title: "OnePlus Watch 3",
    slug: "oneplus-watch-3",
    description: "Ultra-lightweight sports wearable, high-precision heart rate and SpO2 sensor, water resistant 5ATM.",
    price: 38,
    stock: 15,
    sold: 0,
    category_id: 5,
    category: { id: 5, name: "Watch", slug: "watch", name_kh: "នាឡិកា" },
    images: [
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/f0Q0s5ENs2MU1PnSa96DqxKrOaxX6IkgCC44gO6h.webp",
      "https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/aqvO3u4huT3nkDxph7kTkvIko1rsnNq643y3kbAX.webp",
    ],
    attributes: {},
    created_at: "2026-04-25T19:38:21.000000Z",
    title_kh: "OnePlus Watch 3",
    description_kh: "នាឡិកាឆ្លាតវៃ OnePlus Watch 3 សម្រាប់សុខភាពនិងកីឡា។",
  },
];

const CIRCULAR_CATEGORIES = [
  { name: "Smartphones", slug: "phone", icon: Smartphone, discount: "Up to 25% OFF" },
  { name: "Laptops & PC", slug: "laptops", icon: Laptop, discount: "Up to 30% OFF" },
  { name: "Audio Gear", slug: "audio", icon: Headphones, discount: "Up to 40% OFF" },
  { name: "Smart Watches", slug: "wearables", icon: Watch, discount: "Up to 50% OFF" },
  { name: "Gaming Gear", slug: "gaming", icon: Gamepad2, discount: "Up to 20% OFF" },
  { name: "Accessories", slug: "accessories", icon: Cpu, discount: "Up to 35% OFF" },
];

const UITestPage = () => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Fetch real database products (read-only)
  const { data: productsResponse } = useProducts({ limit: 24 });
  const { data: categoriesData } = useCategories();

  const realProducts: Product[] = useMemo(() => {
    if (productsResponse?.data && productsResponse.data.length > 0) {
      return productsResponse.data;
    }
    return INITIAL_DB_PRODUCTS;
  }, [productsResponse]);

  // Dynamic category tabs
  const categoryTabs = useMemo(() => {
    const list = ["All"];
    if (categoriesData) {
      categoriesData.forEach((c) => {
        if (c.name && !list.includes(c.name)) list.push(c.name);
      });
    }
    realProducts.forEach((p) => {
      const catName = p.category?.name;
      if (catName && !list.includes(catName)) list.push(catName);
    });
    return list;
  }, [categoriesData, realProducts]);

  // Spotlight product for Figma Hero banner (Xiao Mi 18 Pro Max)
  const heroProduct = useMemo(() => {
    return (
      realProducts.find((p) => p.slug === "xiao-mi-18-pro-max") ||
      realProducts[0]
    );
  }, [realProducts]);

  // Secondary hero product for slide 2 (OnePlus Watch or HeadPhone G56)
  const heroSecondary = useMemo(() => {
    return (
      realProducts.find(
        (p) =>
          p.slug === "oneplus-watch-5" ||
          p.title.toLowerCase().includes("watch") ||
          p.title.toLowerCase().includes("headphone"),
      ) || heroProduct
    );
  }, [realProducts, heroProduct]);

  const activeDisplayHero = activeHeroSlide === 0 ? heroProduct : heroSecondary;

  // Filtered products for "Grab the best deal" section
  const dealProducts = useMemo(() => {
    return realProducts.filter((product) => {
      const productCatName = product.category?.name || "";
      const matchesCategory =
        selectedCategoryTab === "All" ||
        productCatName.toLowerCase() === selectedCategoryTab.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [realProducts, selectedCategoryTab, searchQuery]);

  return (
    <div
      id="figma-ui-test-page"
      className="min-h-screen bg-[#F5F7FA] dark:bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300 font-sans"
    >
      {/* ===================================================================
          1. FIGMA TOP MICRO-UTILITY BAR (Node 22-474)
          =================================================================== */}
      <div className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Location & Delivery */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-[var(--color-text-primary)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Deliver to:</span>
              <span className="font-bold underline decoration-[var(--color-primary)]">
                Phnom Penh, Cambodia
              </span>
            </div>
            <span className="hidden md:inline text-[var(--color-border)]">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <Truck className="w-3.5 h-3.5 text-[var(--color-success)]" />
              <span>Free Express City Delivery on Orders $50+</span>
            </div>
          </div>

          {/* Right: Contact & Language */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <Phone className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>+855 (0)23 999 888</span>
            </div>
            <span className="text-[var(--color-border)]">|</span>
            <span className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] cursor-pointer">
              ភាសាខ្មែរ / EN
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. FIGMA MAIN BRAND & SEARCH HEADER (Node 22-474)
          =================================================================== */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white shadow-md shadow-[var(--color-primary)]/20">
                <span className="font-black text-xl tracking-tighter">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-[var(--color-text-primary)] leading-none">
                  T-STORE
                </span>
                <span className="text-[10px] font-bold text-[var(--color-primary)] tracking-widest uppercase">
                  Tech Retail
                </span>
              </div>
            </Link>

            {/* Figma-Style Category Select + Search Input */}
            <div className="flex-1 max-w-2xl hidden sm:flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden focus-within:border-[var(--color-primary)] transition-colors">
              <div className="flex items-center gap-1 px-3.5 py-2.5 border-r border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] shrink-0 cursor-pointer">
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </div>
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Search real products (e.g. Xiao Mi, OnePlus, HeadPhone)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
                />
              </div>
              <button
                type="button"
                style={{ color: "#ffffff" }}
                className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--color-bg-surface)] text-xs font-bold text-[var(--color-text-primary)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
                  <User className="w-4 h-4" />
                </div>
                <span>Sign In</span>
              </Link>

              <button
                type="button"
                className="relative p-2 rounded-xl hover:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-error)] text-white text-[9px] font-bold flex items-center justify-center">
                  2
                </span>
              </button>

              <Link
                to="/cart"
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 transition-colors font-bold text-xs"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center">
                    3
                  </span>
                </div>
                <span className="hidden md:inline">$1,307.00</span>
              </Link>
            </div>

          </div>
        </div>

        {/* ===================================================================
            3. FIGMA CATEGORY NAVIGATION SUB-BAR (Node 22-474)
            =================================================================== */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Left: "All Categories" Pill Button */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                style={{ color: "#ffffff" }}
                className="my-1.5 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-bold text-xs shadow-sm hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Horizontal Category Nav Links */}
              <nav className="flex items-center gap-6 text-xs font-semibold text-[var(--color-text-secondary)]">
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Smartphones
                </Link>
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Laptops &amp; PC
                </Link>
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Audio &amp; Sound
                </Link>
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Smart Watches
                </Link>
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Gaming Gear
                </Link>
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Accessories
                </Link>
              </nav>
            </div>

            {/* Right: Flash Deals Tag */}
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-error)]">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Special Weekend Deals</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">

        {/* ===================================================================
            4. FIGMA HERO BILLBOARD BANNER (Node 22-474)
            - Rounded dark midnight navy card container
            - "Best Deal Online on Smart Tech"
            - Giant typography "SMART WEARABLE & FLAGSHIP."
            - "UP TO 40% OFF"
            - Real product showcased from DB (Xiao Mi 18 Pro Max at $1,209.00)
            =================================================================== */}
        <section aria-label="Featured Promotion">
          <div className="relative rounded-3xl bg-[#121928] text-white overflow-hidden p-6 sm:p-10 lg:p-14 border border-white/10 shadow-2xl">
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Best Deal Online on Smart Tech</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                  SMART TECH &amp; <br />
                  <span className="text-[var(--color-primary)]">FLAGSHIPS.</span>
                </h1>

                <div className="flex items-baseline gap-3">
                  <span className="text-xl sm:text-2xl font-bold text-gray-300 uppercase tracking-wide">
                    UP TO
                  </span>
                  <span className="text-3xl sm:text-5xl font-black text-amber-400 drop-shadow-md">
                    40% OFF
                  </span>
                </div>

                <p className="text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed font-light">
                  Experience next-gen flagship performance with authentic manufacturer warranty, 
                  same-day Phnom Penh dispatch, and premium sealed units.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/products"
                    style={{ color: "#ffffff" }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-hover)] active:scale-95 transition-all shadow-lg shadow-[var(--color-primary)]/40 cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Official 1-Year Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Product Image */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center p-4">
                  <img
                    src={getImageUrl(activeDisplayHero?.images?.[0])}
                    alt={activeDisplayHero?.title || "Hero Device"}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  
                  {/* Floating Specs Pill */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-left shadow-lg">
                    <p className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">
                      Featured Model
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {activeDisplayHero?.title || "Xiao Mi 18 Pro Max"}
                    </p>
                    <p className="text-xs font-black text-amber-400">
                      ${Number(activeDisplayHero?.price || 1209).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Carousel Pagination Dots */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveHeroSlide(0)}
                    aria-label="Slide 1"
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      activeHeroSlide === 0
                        ? "w-8 bg-[var(--color-primary)]"
                        : "w-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveHeroSlide(1)}
                    aria-label="Slide 2"
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      activeHeroSlide === 1
                        ? "w-8 bg-[var(--color-primary)]"
                        : "w-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===================================================================
            5. FIGMA CIRCULAR TOP CATEGORIES STRIP (Node 22-474)
            - Horizontal row of rounded category avatars with discount hint
            =================================================================== */}
        <section aria-labelledby="top-categories-heading">
          <div className="flex items-center justify-between mb-6">
            <h2
              id="top-categories-heading"
              className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight"
            >
              Shop From Top Categories
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-primary)] hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CIRCULAR_CATEGORIES.map(({ name, icon: Icon, discount }) => (
              <Link
                key={name}
                to="/products"
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Circular Avatar */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-200 shadow-xs mb-3">
                  <Icon className="w-8 h-8 transition-transform" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {name}
                </h3>
                <span className="text-[10px] font-semibold text-[var(--color-success)] mt-0.5">
                  {discount}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================================
            6. FIGMA "GRAB THE BEST DEAL" PRODUCT SHOWCASE (Node 22-474)
            - Clean cards with discount badge, price comparison,
              and user-annotated 'Detail -->' link!
            =================================================================== */}
        <section aria-labelledby="deals-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Verified Inventory
                </span>
              </div>
              <h2
                id="deals-heading"
                className="text-xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight mt-1"
              >
                Grab the Best Deal on Smartphones &amp; Tech
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategoryTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategoryTab === tab
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid: Real ProductCard with 'Detail -->' */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                title={p.title}
                title_kh={p.title_kh}
                price={Number(p.price)}
                image={p.images?.[0] || ""}
                category={p.category?.name}
                category_kh={p.category?.name_kh}
                stock={p.stock}
                attributes={p.attributes}
                description={p.description}
                description_kh={p.description_kh}
              />
            ))}
          </div>
        </section>

        {/* ===================================================================
            7. FIGMA MULTI-BANNER PROMO STRIP (Node 22-474)
            - 3 side-by-side promotional cards
            =================================================================== */}
        <section aria-label="Special Offers">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Promo 1 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-lg">
              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  Headphones &amp; Audio
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold mt-1 leading-tight text-white">
                  Studio Acoustics <br />Up to 40% OFF
                </h3>
              </div>
              <div className="relative z-10 pt-4">
                <Link
                  to="/products"
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors"
                >
                  <span>Shop Audio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="absolute right-2 bottom-2 w-32 h-32 opacity-80 pointer-events-none">
                <img
                  src="https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/6Bg0ASEebcSr7BWwjfx05LVc7i5YVPWkX8JRgWF9.webp"
                  alt="Headphones"
                  className="w-full h-full object-contain drop-shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
              </div>
            </div>

            {/* Promo 2 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-zinc-950 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-lg">
              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Pro Workstations
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold mt-1 leading-tight text-white">
                  MacBook &amp; Laptops <br />Save Up to $200
                </h3>
              </div>
              <div className="relative z-10 pt-4">
                <Link
                  to="/products"
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors"
                >
                  <span>View Laptops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="absolute right-2 bottom-2 w-32 h-32 opacity-80 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80"
                  alt="Laptop"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
            </div>

            {/* Promo 3 */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-lg">
              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Fitness &amp; Watches
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold mt-1 leading-tight text-white">
                  Smart Watches <br />Starting at $38.00
                </h3>
              </div>
              <div className="relative z-10 pt-4">
                <Link
                  to="/products"
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors"
                >
                  <span>Explore Watches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="absolute right-2 bottom-2 w-32 h-32 opacity-80 pointer-events-none">
                <img
                  src="https://oyeqnewfcudmvtvvqznu.supabase.co/storage/v1/object/public/images/products/5iqEXP4N5xXat7JrfV5oyF7oEoqvORPoNCMdMrOA.webp"
                  alt="Smartwatch"
                  className="w-full h-full object-contain drop-shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================
            8. BENTO CATEGORY COLLECTIONS (BrowseByCategories)
            =================================================================== */}
        <BrowseByCategories />

      </main>

      {/* ===================================================================
          9. FIGMA FULL-BLEED BRANDED ROYAL BLUE FOOTER (Node 22-474)
          =================================================================== */}
      <footer className="mt-16 bg-[#008ECC] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Col 1: Brand & Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white text-[#008ECC] flex items-center justify-center font-black text-lg">
                  T
                </div>
                <span className="font-black text-2xl tracking-tight text-white">
                  T-STORE
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                Cambodia's verified retail hub for flagship electronics, authentic warranty coverage, and same-day city fulfillment.
              </p>
              <div className="pt-2 space-y-1.5 text-xs">
                <p className="font-bold text-white">Customer Support Hotline:</p>
                <p className="text-sm font-black text-amber-300">+855 (0)23 999 888</p>
                <p className="text-white/80 text-[11px]">Daily 8:00 AM – 9:00 PM</p>
              </div>
            </div>

            {/* Col 2: Most Popular Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold tracking-wider uppercase text-white border-b border-white/20 pb-2">
                Popular Categories
              </h4>
              <ul className="space-y-2 text-xs text-white/85">
                <li><Link to="/products" className="hover:text-white hover:underline">Smartphones &amp; 5G</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Pro Laptops &amp; Displays</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Acoustic Headphones</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Fitness Smart Watches</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Gaming Accessories</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold tracking-wider uppercase text-white border-b border-white/20 pb-2">
                Customer Services
              </h4>
              <ul className="space-y-2 text-xs text-white/85">
                <li><Link to="/products" className="hover:text-white hover:underline">Track Your Order</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Warranty Claims</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Return &amp; Refund Policy</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Phnom Penh Delivery Hubs</Link></li>
                <li><Link to="/products" className="hover:text-white hover:underline">Terms &amp; Conditions</Link></li>
              </ul>
            </div>

            {/* Col 4: Store Info & Branches */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold tracking-wider uppercase text-white border-b border-white/20 pb-2">
                Showrooms
              </h4>
              <p className="text-xs text-white/85 leading-relaxed">
                <strong className="text-white">Main Branch:</strong> #128 Preah Norodom Blvd, Phnom Penh, Cambodia.
              </p>
              <p className="text-xs text-white/85 leading-relaxed">
                <strong className="text-white">Toul Kork Hub:</strong> St 315, Toul Kork, Phnom Penh.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold text-white">
                  ✓ Verified Official Distributor
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Payment */}
          <div className="mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80">
            <p>© 2026 T-Store Cambodia. All rights reserved.</p>
            <div className="flex items-center gap-3 font-semibold text-[11px]">
              <span>Accepted Payments:</span>
              <span className="px-2 py-0.5 rounded bg-white text-[#008ECC] font-bold">ABA PAY</span>
              <span className="px-2 py-0.5 rounded bg-white text-[#008ECC] font-bold">WING</span>
              <span className="px-2 py-0.5 rounded bg-white text-[#008ECC] font-bold">VISA</span>
              <span className="px-2 py-0.5 rounded bg-white text-[#008ECC] font-bold">MASTERCARD</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default UITestPage;
