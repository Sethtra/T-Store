import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useLandingData } from "../../hooks/useLandingData";

const CuratedExcellence = () => {
  const { data: landingData } = useLandingData();
  const galleryItems = landingData?.landing_sections
    ?.filter((section) => section.section_type === "curated_excellence")
    ?.sort((a, b) => a.order - b.order) || [];

  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  // Total items = intro panel + gallery cards (dynamic or fallback 3)
  const totalItems = Math.max(galleryItems.length, 3) + 1;
  // Each card needs ~100vh of scroll height to feel smooth
  const sectionHeight = `${totalItems * 100}vh`;

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setScrollRange(
          scrollContainerRef.current.scrollWidth - window.innerWidth,
        );
      }
    };
    // Delay to ensure DOM has rendered the dynamic items
    const timeout = setTimeout(handleResize, 300);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [galleryItems.length]);

  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end end"],
  });

  // Pause the scroll for the last 15% of the container height so the user can look at the last item
  const xTransform = useTransform(
    horizontalProgress,
    [0, 0.85],
    [0, -scrollRange],
  );

  return (
    <section
      ref={horizontalScrollRef}
      className="relative z-10 bg-[var(--color-bg-primary)]"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          ref={scrollContainerRef}
          style={{ x: xTransform }}
          className="flex gap-8 px-8 lg:px-32 w-max"
        >
          {/* Intro text for horizontal scroll */}
          <div className="w-[80vw] sm:w-[40vw] shrink-0 flex flex-col justify-center pr-12">
            <h2 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-[var(--color-text-primary)]">
              Curated <br />
              <span className="text-indigo-500">Excellence.</span>
            </h2>
            <p className="text-xl text-[var(--color-text-muted)] leading-relaxed">
              Swipe through our hand-picked selections. Every piece is a
              statement, blending cutting-edge design with timeless aesthetics.
            </p>
          </div>

          {/* Gallery Items */}
          {galleryItems.map((item, i) => (
            <div
              key={item.id || i}
              className="w-[85vw] sm:w-[50vw] md:w-[40vw] h-[60vh] shrink-0 relative rounded-[3rem] overflow-hidden group"
            >
              <img
                src={item.image ? (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${item.image}`) : item.product?.image_url || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1200"}
                alt={item.title || item.product?.title || "Gallery Image"}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {/* Keep gradient dark so the white text is always visible regardless of theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-10 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">
                  {item.description || item.product?.category || "Featured"}
                </p>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                  {item.title || item.product?.title}
                </h3>
                <Link to={item.product ? `/products/${item.product.slug}` : "/products"}>
                  <button className="opacity-0 group-hover:opacity-100 px-8 py-4 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all duration-500 delay-100">
                    Explore <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
          
          {/* Fallback items if none are configured in admin yet */}
          {galleryItems.length === 0 && [
            {
              img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1200",
              title: "Urban Noir",
              sub: "Streetwear",
            },
            {
              img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
              title: "Minimalist",
              sub: "Accessories",
            },
            {
              img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
              title: "Sonic Purity",
              sub: "Audio",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="w-[85vw] sm:w-[50vw] md:w-[40vw] h-[60vh] shrink-0 relative rounded-[3rem] overflow-hidden group"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-10 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">
                  {item.sub}
                </p>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                  {item.title}
                </h3>
                <Link to="/products">
                  <button className="opacity-0 group-hover:opacity-100 px-8 py-4 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all duration-500 delay-100">
                    Explore <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CuratedExcellence;
