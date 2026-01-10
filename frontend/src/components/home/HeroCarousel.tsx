import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMainBanners } from "../../hooks/useBanners";

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: banners, isLoading } = useMainBanners();

  // Auto-rotate
  useEffect(() => {
    if (banners && banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  if (isLoading || !banners || banners.length === 0) {
    return (
      <section className="relative min-h-screen pt-20 bg-gradient-to-br from-[var(--color-bg-surface)] via-[var(--color-bg-elevated)] to-[var(--color-bg-surface)] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-[var(--color-text-muted)]">Loading banners...</p>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative pt-36 pb-12 bg-[var(--color-bg-primary)] min-h-[80vh] flex flex-col items-center justify-center overflow-hidden transition-colors duration-300">
      {/* Background Decorative Flow */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-full h-96 text-[var(--color-border)] transition-colors duration-300"
          viewBox="0 0 1440 320"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            {/* Top Text Content */}
            <div className="text-center mb-8 max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animated-gradient-text"
                style={{
                  background: currentBanner.text_color
                    ? `linear-gradient(135deg, ${currentBanner.text_color} 0%, var(--color-primary) 50%, ${currentBanner.text_color} 100%)`
                    : "linear-gradient(135deg, #ff7f50 0%, var(--color-primary) 50%, #ff7f50 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 3s ease infinite",
                }}
              >
                {currentBanner.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-xl mx-auto"
              >
                {currentBanner.description}
              </motion.p>
            </div>

            {/* Image Container */}
            <div className="relative w-full max-w-6xl aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-[var(--color-bg-secondary)] transition-colors duration-300">
              <motion.img
                key={currentBanner.image}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.7 }}
                src={currentBanner.image}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Navigation Arrows */}
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prev) =>
                      (prev - 1 + (banners?.length || 1)) %
                      (banners?.length || 1)
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:scale-110 transition-all z-30 bg-black/20 rounded-full backdrop-blur-sm"
              >
                <svg
                  className="w-8 h-8 md:w-10 md:h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % (banners?.length || 1))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:scale-110 transition-all z-30 bg-black/20 rounded-full backdrop-blur-sm"
              >
                <svg
                  className="w-8 h-8 md:w-10 md:h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Action Buttons - Bottom Right overlay */}
              <div className="absolute bottom-8 right-12 flex items-center gap-4 z-20">
                {currentBanner.primary_button_text &&
                  currentBanner.primary_button_link && (
                    <Link to={currentBanner.primary_button_link || "#"}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 bg-white text-black text-sm md:text-base font-bold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        {currentBanner.primary_button_text}
                      </motion.button>
                    </Link>
                  )}
                {currentBanner.secondary_button_text &&
                  currentBanner.secondary_button_link && (
                    <Link to={currentBanner.secondary_button_link || "#"}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 bg-black/60 backdrop-blur-md text-white border border-white/20 text-sm md:text-base font-bold rounded-full hover:bg-black/80 transition-colors"
                      >
                        {currentBanner.secondary_button_text}
                      </motion.button>
                    </Link>
                  )}
              </div>

              {/* Bottom Left Info (Static Contact/Socials mock) */}
              <div className="absolute bottom-8 left-12 flex items-center gap-6 text-white/90 text-sm font-medium hidden md:flex z-20">
                <span>456 - 987 / hiking@mail.com</span>
                <div className="flex gap-4 text-xl">
                  <i className="fa-brands fa-youtube hover:text-red-500 cursor-pointer transition-colors"></i>
                  <i className="fa-brands fa-twitter hover:text-blue-400 cursor-pointer transition-colors"></i>
                  <i className="fa-brands fa-instagram hover:text-pink-500 cursor-pointer transition-colors"></i>
                  <i className="fa-brands fa-facebook hover:text-blue-600 cursor-pointer transition-colors"></i>
                </div>
              </div>
            </div>

            {/* Navigation Dots Below Image */}
            <div className="flex gap-2 mt-8">
              {banners &&
                banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-300 rounded-full h-2 ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
