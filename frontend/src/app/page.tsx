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
      const sections = ["logic", "network"];
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
          <Link href="#logic" className={`transition-colors ${activeSection === "logic" ? "text-green-600 font-bold" : "hover:text-green-600"}`}>Algorithm</Link>
          <Link href="#network" className={`transition-colors ${activeSection === "network" ? "text-green-600 font-bold" : "hover:text-green-600"}`}>Network</Link>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* The Logic Section */}
      <motion.section id="logic" className="py-32 px-6 md:px-12 border-b border-gray-200" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display font-bold text-5xl tracking-tight mb-8">THE ALGORITHM.</h2>
              <p className="font-body text-gray-600 text-lg mb-8 leading-relaxed">
                GroNow isn't just a delivery app; it's a decentralized logistics protocol for the city. When you place an order, our engine evaluates store proximity, live inventory, and driver availability in milliseconds.
              </p>
              <div className="space-y-6 font-mono text-sm">
                <div className="border-l-2 border-gronow-turmeric pl-4 py-1">
                  <div className="text-gray-900 font-bold mb-1">01. COMPILE</div>
                  <div className="text-gray-600">Cart items mapped against 50+ local vendor APIs.</div>
                </div>
                <div className="border-l-2 border-gray-200 pl-4 py-1">
                  <div className="text-gray-900 font-bold mb-1">02. ROUTE</div>
                  <div className="text-gray-600">PostGIS radius scan (max 5km) identifies optimal node.</div>
                </div>
                <div className="border-l-2 border-gray-200 pl-4 py-1">
                  <div className="text-gray-900 font-bold mb-1">03. DISPATCH</div>
                  <div className="text-gray-600">Nearest rider pinged via WebSockets.</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-8 border border-gray-200 font-mono text-xs text-green-700 overflow-hidden relative rounded-2xl shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gronow-turmeric to-transparent opacity-50"></div>
              <p className="mb-2">{`> INITIALIZING SPATIAL QUERY...`}</p>
              <p className="mb-2 opacity-70">{`> SELECT id, name FROM stores WHERE ST_DWithin(location, POINT(85.8245 20.2960), 5000);`}</p>
              <p className="mb-2">{`> 3 NODES FOUND.`}</p>
              <p className="mb-2 opacity-70">{`> EVALUATING INVENTORY GRAPH...`}</p>
              <p className="mb-2">{`> MATCH IDENTIFIED: STORE_ID_092 (1.2KM)`}</p>
              <p className="mb-2 text-green-600">{`> DISPATCHING RIDER_ID_404...`}</p>
              <p className="mt-8 animate-pulse text-gray-900">{`_`}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Network / Partners Section */}
      <motion.section id="network" className="py-32 px-6 md:px-12 bg-green-600 text-white" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight max-w-2xl">
              PLUG YOUR STORE INTO THE GRID.
            </h2>
            <Link href="/auth?role=STORE_OWNER" className="font-display font-bold text-sm bg-white text-green-600 px-8 py-4 hover:bg-black transition-colors shrink-0">
              OPEN STORE PORTAL
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-t-2 border-green-500 pt-6">
              <h3 className="font-display font-bold text-2xl mb-4">Zero Infrastructure</h3>
              <p className="font-body text-green-50">We provide the dashboard, the drivers, and the customers. You provide the physical inventory. Become a dark store node overnight.</p>
            </div>
            <div className="border-t-2 border-green-500 pt-6">
              <h3 className="font-display font-bold text-2xl mb-4">Instant Payouts</h3>
              <p className="font-body text-green-50">Algorithms handle the split-routing; smart contracts handle the ledger. Get paid daily for fulfilled sub-orders.</p>
            </div>
            <div className="border-t-2 border-green-500 pt-6">
              <h3 className="font-display font-bold text-2xl mb-4">Hyper-Local Reach</h3>
              <p className="font-body text-green-50">Stop relying on foot traffic. Expose your fresh produce to thousands of users within a 5km radius instantly.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Driver / Fleet Section */}
      <motion.section className="py-32 px-6 md:px-12 border-b border-gray-200" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 border border-gray-200 p-8 bg-gray-50 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-4">
              <span className="font-mono text-green-600 font-bold">DRIVER.TERMINAL</span>
              <span className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
            </div>
            <div className="space-y-4 font-mono text-sm text-gray-600">
              <div className="flex justify-between"><span>STATUS:</span> <span className="text-gray-900 font-bold">ONLINE</span></div>
              <div className="flex justify-between"><span>ZONE:</span> <span className="text-gray-900 font-bold">PATIA_01</span></div>
              <div className="flex justify-between"><span>EARNINGS_TODAY:</span> <span className="text-green-600 font-bold">₹1,450.00</span></div>
            </div>
            <Link href="/auth?role=DRIVER" className="mt-12 block text-center font-display font-bold text-sm bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-xl hover:bg-green-600 hover:text-white hover:border-transparent transition-all shadow-sm">
              ACCESS DRIVER PORTAL
            </Link>
          </div>
          
          <div className="order-1 md:order-2">
            <h2 className="font-display font-bold text-5xl tracking-tight mb-8">THE FLEET.</h2>
            <p className="font-body text-gray-600 text-lg mb-8 leading-relaxed">
              Our delivery partners operate on a high-density, short-distance model. No 15km trips. No highway driving. Pure local optimization.
            </p>
            <ul className="space-y-4 font-mono text-sm text-gray-600">
              <li className="flex items-center gap-3"><span className="text-green-600 font-bold">+</span> Maximum 3km delivery radius</li>
              <li className="flex items-center gap-3"><span className="text-green-600 font-bold">+</span> Batch routing for higher earnings</li>
              <li className="flex items-center gap-3"><span className="text-green-600 font-bold">+</span> Weekly milestone bonuses</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 font-mono text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          GRO_NOW // BBSR_SMART_CITY // EST. 2026
        </div>
        <div className="flex gap-6">
          <Link href="/auth?role=ADMIN" className="hover:text-gray-900 transition-colors">ADMIN.ACCESS</Link>
          <span className="text-[#333330]">|</span>
          <a href="#" className="hover:text-gray-900 transition-colors">TERMS.TXT</a>
          <a href="#" className="hover:text-gray-900 transition-colors">PRIVACY.TXT</a>
        </div>
      </footer>
    </main>
  );
}