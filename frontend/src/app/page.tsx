"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

// Signature Element: The Routing Line (Dynamic SVG)
function RoutingLine() {
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    // Simple animation loop for the SVG dash array
    const interval = setInterval(() => {
      setPathLength((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-50 pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
        <motion.path
          d="M-100,200 L150,250 L200,100 L400,300 L500,150 L750,450 L900,200 L1100,500"
          fill="none"
          stroke="#16a34a"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />
        <motion.path
          d="M-50,600 L100,500 L300,700 L550,550 L800,800 L1100,600"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeDasharray="10 10"
          initial={{ x: -100 }}
          animate={{ x: 1000 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        />
      </svg>
    </div>
  );
}


// Scrolling Grocery Bags Animation
function ScrollingBags() {
  const bags = ["🛒", "🛍️", "🍎", "🥦", "🍞", "🥛", "🥚", "🥩"];
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <motion.div 
        className="flex gap-16 absolute top-[20%] left-0 text-6xl whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      >
        {[...bags, ...bags, ...bags, ...bags].map((emoji, i) => (
          <span key={i} className="inline-block">{emoji}</span>
        ))}
      </motion.div>
      <motion.div 
        className="flex gap-24 absolute top-[60%] right-0 text-7xl whitespace-nowrap"
        animate={{ x: ["-50%", "0%"] }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      >
        {[...bags, ...bags, ...bags, ...bags].reverse().map((emoji, i) => (
          <span key={i} className="inline-block">{emoji}</span>
        ))}
      </motion.div>
    </div>
  );
}


export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["faq"];
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= (el.offsetTop - 200)) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-yellow-200 selection:text-green-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="font-display font-black text-2xl tracking-tighter text-gray-900">
          GRONOW<span className="text-green-600">.</span>
        </div>
        <div className="hidden md:flex space-x-8 font-mono text-xs tracking-widest uppercase">
          <Link href="/about" className="hover:text-green-600 transition-colors">About</Link>
          <Link href="#faq" className={`transition-colors ${activeSection === "faq" ? "text-green-600 font-bold" : "hover:text-green-600"}`}>FAQ</Link>
          <Link href="/auth?role=STORE_OWNER" className="hover:text-green-600 transition-colors">Partner Login</Link>
        </div>
        <Link href="/auth?role=CUSTOMER" className="font-display font-bold text-sm bg-green-600 text-white px-6 py-2 hover:bg-white hover:text-green-600 transition-colors border border-transparent hover:border-green-600">
          START ORDER
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 border-b border-gray-200 bg-yellow-50 overflow-hidden">
        <ScrollingBags />
        <RoutingLine />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-fade-in-up">
            <div className="font-mono text-green-600 mb-6 text-sm flex items-center gap-4 font-bold">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              LIVE IN BHUBANESWAR (PATIA, KIIT ROAD, CHANDRASEKHARPUR)
            </div>
            <h1 className="font-display font-black text-7xl md:text-9xl leading-[0.85] tracking-tighter mb-8 uppercase max-w-5xl text-gray-900">
              Groceries.<br />
              <span className="text-green-600 drop-shadow-sm">15 Minutes.</span>
            </h1>
            <p className="font-body text-xl md:text-2xl font-light max-w-2xl text-gray-600 mb-12 leading-relaxed">
              We abstract the physical store. Our PostGIS routing engine connects your cart to the nearest partner inventory instantly. Extreme local logistics, zero filler.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/auth?role=CUSTOMER" className="group flex items-center justify-between font-display font-bold text-lg bg-green-600 text-white px-8 py-5 hover:bg-white hover:text-green-600 transition-all border border-transparent hover:border-green-600 w-full sm:w-auto min-w-[240px]">
                <span>START ORDER</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              <div className="flex flex-col justify-center font-mono text-xs text-gray-600">
                <span>AVG. DELIVERY TIME: 14M 32S</span>
                <span>ACTIVE NODES: 42 STORES</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Advertisements Section */}
      <motion.section className="py-24 px-6 md:px-12 bg-white" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          {/* Promo 1 */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[400px] w-full group cursor-pointer">
            <img src="/images/promo_banner_mango.jpg" alt="Mango Mania" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8 md:p-16">
              <div className="max-w-lg text-white">
                <h3 className="font-display font-bold text-4xl md:text-6xl mb-4 text-gronow-turmeric">MANGO MANIA!</h3>
                <p className="text-lg md:text-xl font-medium mb-8">Treat yourself to the freshest Alphonso mangoes, delivered in 15 minutes. Pure summer bliss.</p>
                <Link href="/auth?role=CUSTOMER" className="inline-block bg-gronow-turmeric text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors">SHOP NOW</Link>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Promo 2 */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 w-full group cursor-pointer">
              <img src="/images/promo_banner_midnight.jpg" alt="Midnight Cravings" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="font-display font-bold text-3xl mb-2 text-blue-400">MIDNIGHT CRAVINGS?</h3>
                  <p className="font-medium mb-4">We've got your late-night snacks covered. Open 24/7.</p>
                  <Link href="/auth?role=CUSTOMER" className="inline-block bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors">ORDER SNACKS</Link>
                </div>
              </div>
            </div>

            {/* Promo 3 */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 w-full group cursor-pointer">
              <img src="/images/promo_banner_icecream.jpg" alt="Ice Cream Store" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="font-display font-bold text-3xl mb-2 text-pink-400">ICE CREAM STORE</h3>
                  <p className="font-medium mb-4">Beat the heat with our premium ice cream selection.</p>
                  <Link href="/auth?role=CUSTOMER" className="inline-block bg-pink-500 text-white font-bold py-2 px-6 rounded-full hover:bg-pink-600 transition-colors">EXPLORE</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>



      {/* FAQ Section */}
      <motion.section id="faq" className="py-24 px-6 md:px-12 bg-white" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-4xl mb-12 text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group bg-gray-50 p-6 rounded-2xl cursor-pointer [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-lg text-gray-900 outline-none">
                How do you deliver in 15 minutes?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">We operate a decentralized network of dark stores and partner with local vendors across the city. When you order, our algorithm routes it to the absolute closest node, and our dedicated riders bring it straight to you without multi-stops.</p>
            </details>
            <details className="group bg-gray-50 p-6 rounded-2xl cursor-pointer [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-lg text-gray-900 outline-none">
                What areas do you currently serve?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">We are currently live in Bhubaneswar, specifically serving Patia, KIIT Road, and Chandrasekharpur zones. We are expanding rapidly!</p>
            </details>
            <details className="group bg-gray-50 p-6 rounded-2xl cursor-pointer [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-lg text-gray-900 outline-none">
                Can I partner my store with GroNow?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">Yes! You can plug your store into our grid. Just click on "Store Partner" at the bottom of the page, fill out the application, and if verified, you can start receiving digital orders instantly.</p>
            </details>
            <details className="group bg-gray-50 p-6 rounded-2xl cursor-pointer [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-lg text-gray-900 outline-none">
                Is there a delivery fee?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">Orders above ₹199 enjoy free delivery! A nominal fee of ₹25 is applied for orders below that amount to support our rider network.</p>
            </details>
          </div>
        </div>
      </motion.section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 px-6 md:px-12 font-body">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <h2 className="font-display font-bold text-3xl text-gronow-turmeric mb-6">GRONOW<span className="text-green-500">.</span></h2>
            <p className="text-gray-400 mb-6 leading-relaxed">Abstracting the physical store. The ultimate 15-minute decentralized logistics protocol for the city of Bhubaneswar.</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">in</a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">tw</a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">ig</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 tracking-wide uppercase text-gray-300">Portals</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/customer" className="hover:text-white transition-colors">Customer Login</Link></li>
              <li><Link href="/auth?role=STORE_OWNER" className="hover:text-white transition-colors">Store Partner Login</Link></li>
              <li><Link href="/auth?role=DRIVER" className="hover:text-white transition-colors">Delivery Fleet Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 tracking-wide uppercase text-gray-300">Company</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#team" className="hover:text-white transition-colors">About the Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 tracking-wide uppercase text-gray-300">Legal</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><Link href="/auth?role=ADMIN" className="hover:text-red-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© 2026 GroNow Technologies. All rights reserved.</p>
          <p>Built with passion in Bhubaneswar.</p>
        </div>
      </footer>
    </main>
  );
}