import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShoppingBag, Star, Zap, Play } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const TestPlaygroundPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform for horizontal scroll section
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setScrollRange(scrollContainerRef.current.scrollWidth - window.innerWidth);
      }
    };
    // Small delay to ensure styles and fonts are loaded before calculating width
    const timeout = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end end"]
  });
  
  // Pause the scroll for the last 20% of the container height so the user can look at the last item
  const xTransform = useTransform(horizontalProgress, [0, 0.8], [0, -scrollRange]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-indigo-500/30 font-sans -mt-16 pt-16 relative">
      {/* Dynamic continuous background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/10 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-white/80">Next Gen E-Commerce</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1]">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
              Lifestyle.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed">
            Discover curated collections of premium products designed to merge aesthetics with unparalleled functionality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden flex items-center justify-center gap-2 transition-transform hover:scale-105">
              Shop Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-full border border-white/20 bg-transparent hover:bg-white/5 backdrop-blur-md font-bold text-lg flex items-center justify-center gap-2 transition-all hover:border-white/40">
              <Play className="w-5 h-5" fill="currentColor" /> Watch Video
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 relative w-full aspect-square max-w-[600px]"
        >
          <img 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000" 
            alt="Premium Sneaker" 
            className="w-full h-full object-cover rounded-[3rem] shadow-2xl relative z-10"
          />
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-10 -left-10 bg-black/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center gap-4 z-20 shadow-2xl"
          >
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">New Drop</p>
              <p className="font-black text-lg text-white">Air Max Pro</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Connected Marquee */}
      <div className="relative z-10 w-full py-8 bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5 overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex gap-16 px-8 items-center whitespace-nowrap"
        >
          {[...Array(2)].map((_, idx) => (
             <div key={idx} className="flex gap-16 items-center">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/40 uppercase tracking-widest">Premium Quality</span>
                <Star className="w-6 h-6 text-white/20" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/40 uppercase tracking-widest">Fast Delivery</span>
                <Star className="w-6 h-6 text-white/20" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/40 uppercase tracking-widest">Secure Checkout</span>
                <Star className="w-6 h-6 text-white/20" />
             </div>
          ))}
        </motion.div>
      </div>

      {/* Horizontal Scroll Gallery seamlessly attached */}
      <section ref={horizontalScrollRef} className="relative z-10 h-[300vh] bg-[var(--color-bg)]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div ref={scrollContainerRef} style={{ x: xTransform }} className="flex gap-8 px-8 lg:px-32 w-max">
            
            {/* Intro text for horizontal scroll */}
            <div className="w-[80vw] sm:w-[40vw] shrink-0 flex flex-col justify-center pr-12">
              <h2 className="text-5xl md:text-7xl font-black leading-tight mb-6">Curated <br/><span className="text-indigo-400">Excellence.</span></h2>
              <p className="text-xl text-white/50 leading-relaxed">
                Swipe through our hand-picked selections. Every piece is a statement, blending cutting-edge design with timeless aesthetics.
              </p>
            </div>

            {/* Gallery Items */}
            {[
              { img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1200", title: "Urban Noir", sub: "Streetwear" },
              { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200", title: "Minimalist", sub: "Accessories" },
              { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200", title: "Sonic Purity", sub: "Audio" },
            ].map((item, i) => (
              <div key={i} className="w-[85vw] sm:w-[50vw] md:w-[40vw] h-[60vh] shrink-0 relative rounded-[3rem] overflow-hidden group">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-10 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">{item.sub}</p>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6">{item.title}</h3>
                  <button className="opacity-0 group-hover:opacity-100 px-8 py-4 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all duration-500 delay-100">
                     Explore <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sticky Stacked Cards Section */}
      <section className="relative z-20 bg-[var(--color-bg)] py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-32">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">The Standard.</h2>
          <p className="text-xl text-white/50 font-light">Why settle for ordinary when you can have extraordinary?</p>
        </div>

        <div className="max-w-6xl mx-auto relative pb-32">
          {/* Card 1 */}
          <div className="sticky top-24 w-full min-h-[60vh] rounded-[3rem] bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden mb-12 flex flex-col md:flex-row items-stretch group">
            <div className="flex-1 p-12 lg:p-20 z-10 flex flex-col justify-center">
              <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-4 block">01 / Quality</span>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Zero Compromise.</h3>
              <p className="text-xl text-white/60 leading-relaxed font-light">We believe in using only the highest grade materials. From aerospace-grade aluminum to full-grain leather, if it doesn't meet our impossible standards, it doesn't ship.</p>
            </div>
            <div className="flex-1 w-full h-64 md:h-auto relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="sticky top-32 w-full min-h-[60vh] rounded-[3rem] bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden mb-12 flex flex-col md:flex-row-reverse items-stretch group">
            <div className="flex-1 p-12 lg:p-20 z-10 flex flex-col justify-center">
              <span className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-4 block">02 / Ecosystem</span>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Seamless Flow.</h3>
              <p className="text-xl text-white/60 leading-relaxed font-light">Our products talk to each other. Experience a curated ecosystem that just works, right out of the box. No friction, just pure functionality.</p>
            </div>
            <div className="flex-1 w-full h-64 md:h-auto relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="sticky top-40 w-full min-h-[60vh] rounded-[3rem] bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col md:flex-row items-stretch group">
            <div className="flex-1 p-12 lg:p-20 z-10 flex flex-col justify-center">
              <span className="text-rose-400 font-bold uppercase tracking-widest text-sm mb-4 block">03 / Impact</span>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Sustainable Future.</h3>
              <p className="text-xl text-white/60 leading-relaxed font-light">100% carbon neutral shipping and fully recycled packaging. Because leaving a lasting impression shouldn't mean leaving a footprint.</p>
            </div>
            <div className="flex-1 w-full h-64 md:h-auto relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Island CTA */}
      <section className="relative z-30 pb-16 pt-16 px-4 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto bg-gradient-to-b from-white/10 to-transparent backdrop-blur-3xl border border-white/20 rounded-[3rem] p-12 md:p-24 text-center shadow-[0_0_100px_rgba(99,102,241,0.15)] relative overflow-hidden">
           {/* Animated Glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 space-y-8">
             <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter">Ready to join?</h2>
             <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">Get early access to exclusive drops, insider updates, and a 15% discount on your first order.</p>
             
             <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
               <input type="email" placeholder="Enter your email" className="w-full sm:w-96 bg-black/40 border border-white/20 rounded-full px-8 py-5 text-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-white/40 shadow-inner" />
               <button className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black rounded-full transition-transform hover:scale-105 text-lg shadow-xl">
                 Subscribe
               </button>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default TestPlaygroundPage;
