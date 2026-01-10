import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text/Speech */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Crafted by One, <br />
              <span className="text-[var(--color-primary)]">
                Built for Everyone.
              </span>
            </h1>

            <div className="prose dark:prose-invert prose-lg text-[var(--color-text-secondary)]">
              <p className="leading-relaxed">
                "Hello! I'm the sole developer behind T-Store. What started as a
                passion project to explore the limits of modern web design has
                evolved into the premium e-commerce experience you see today."
              </p>
              <p className="leading-relaxed">
                My goal was simple: creating a digital storefront that doesn't
                just sell products, but tells a story. Every pixel, every
                interaction, and every line of code was meticulously crafted to
                ensure speed, beauty, and accessibility.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--color-border)]"></div>
                <span className="text-sm font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
                  The Creator
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]"></div>
              </div>
              <p className="text-xl font-handwriting font-medium text-center italic text-[var(--color-text-primary)]">
                Seth Tran
              </p>
            </div>
          </motion.div>

          {/* Right Column: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[3/4] md:aspect-square rounded-[2.5rem] overflow-hidden bg-[var(--color-bg-secondary)] relative group">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
                alt="Founder"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay/Glass card */}
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-lg">Seth Tran</p>
                    <p className="text-white/80 text-sm">
                      Full Stack Developer
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
