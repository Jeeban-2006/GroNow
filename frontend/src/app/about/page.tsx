"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 selection:bg-yellow-200 selection:text-green-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">
        <Link href="/" className="font-display font-black text-2xl tracking-tighter text-gray-900 hover:opacity-80 transition-opacity">
          GRONOW<span className="text-green-600">.</span>
        </Link>
        <Link href="/" className="font-mono text-sm font-bold text-gray-600 hover:text-green-600 transition-colors">
          ← BACK TO HOME
        </Link>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 bg-white border-b border-gray-200 text-center">
        <motion.h1 
          className="font-display font-black text-5xl md:text-7xl mb-6 text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          Behind <span className="text-green-600">GroNow</span>
        </motion.h1>
        <motion.p 
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 font-medium"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          Abstracting the physical store. We are a decentralized logistics protocol disguised as a 15-minute grocery delivery app.
        </motion.p>
      </section>

      {/* Features / Project Info */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-12 text-center">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-bold text-xl mb-3">15-Minute Delivery</h3>
            <p className="text-gray-600 leading-relaxed">Our advanced routing algorithms connect your cart to the closest local vendor, eliminating multi-stops and ensuring lightning-fast fulfillment.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="font-bold text-xl mb-3">Decentralized Network</h3>
            <p className="text-gray-600 leading-relaxed">We don't own massive warehouses. We plug existing local stores and dark stores into our grid, empowering local businesses.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="font-bold text-xl mb-3">Hyper-Local Logistics</h3>
            <p className="text-gray-600 leading-relaxed">Using PostGIS radius scans, we create a high-density, short-distance model. No 15km trips. Pure local optimization.</p>
          </div>
        </div>
      </section>



      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 px-6 md:px-12 font-body">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <h2 className="font-display font-bold text-3xl text-gronow-turmeric mb-6">GRONOW<span className="text-green-500">.</span></h2>
            <p className="text-gray-400 mb-6 leading-relaxed">Abstracting the physical store. The ultimate 15-minute decentralized logistics protocol for the city of Bhubaneswar.</p>
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
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
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
