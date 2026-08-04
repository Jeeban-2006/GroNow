"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

// ─── Product image helpers ─────────────────────────────────────────────────
const KEYWORD_EMOJI: [string[], string, string][] = [
  [['tomato', 'tamatar'], '🍅', 'from-red-50 to-red-100'],
  [['onion', 'pyaz', 'pyaaz'], '🧅', 'from-amber-50 to-orange-100'],
  [['potato', 'aloo', 'alu'], '🥔', 'from-yellow-50 to-amber-100'],
  [['banana', 'kela'], '🍌', 'from-yellow-50 to-yellow-100'],
  [['apple', 'seb'], '🍎', 'from-red-50 to-pink-100'],
  [['mango', 'aam'], '🥭', 'from-orange-50 to-yellow-100'],
  [['grape', 'angur'], '🍇', 'from-purple-50 to-violet-100'],
  [['orange', 'narangi', 'santra'], '🍊', 'from-orange-50 to-orange-100'],
  [['lemon', 'nimbu'], '🍋', 'from-yellow-50 to-lime-100'],
  [['watermelon', 'tarbooj'], '🍉', 'from-green-50 to-red-100'],
  [['carrot', 'gajar'], '🥕', 'from-orange-50 to-orange-100'],
  [['spinach', 'palak', 'pालक'], '🥬', 'from-green-50 to-green-100'],
  [['broccoli'], '🥦', 'from-green-50 to-green-100'],
  [['capsicum', 'pepper', 'shimla'], '🫑', 'from-green-50 to-green-100'],
  [['cauliflower', 'gobhi'], '🥦', 'from-gray-50 to-slate-100'],
  [['bread', 'roti', 'chapati', 'naan', 'pav'], '🍞', 'from-amber-50 to-yellow-100'],
  [['cake', 'pastry', 'muffin'], '🎂', 'from-pink-50 to-rose-100'],
  [['biscuit', 'cookie', 'bourbon'], '🍪', 'from-amber-50 to-brown-100'],
  [['milk', 'doodh'], '🥛', 'from-blue-50 to-slate-100'],
  [['butter'], '🧈', 'from-yellow-50 to-amber-100'],
  [['cheese', 'paneer'], '🧀', 'from-yellow-50 to-amber-100'],
  [['curd', 'dahi', 'yogurt', 'yoghurt'], '🥛', 'from-white to-gray-100'],
  [['ice cream', 'icecream'], '🍦', 'from-pink-50 to-rose-100'],
  [['egg', 'anda'], '🥚', 'from-yellow-50 to-orange-100'],
  [['chicken', 'murgi', 'murga'], '🍗', 'from-orange-50 to-amber-100'],
  [['fish', 'machli', 'salmon', 'tuna'], '🐟', 'from-blue-50 to-cyan-100'],
  [['rice', 'chawal', 'basmati'], '🍚', 'from-gray-50 to-white'],
  [['wheat', 'atta', 'flour', 'maida'], '🌾', 'from-yellow-50 to-amber-100'],
  [['dal', 'lentil', 'pulse', 'chana', 'moong', 'rajma'], '🫘', 'from-amber-50 to-yellow-100'],
  [['oil', 'tel', 'ghee', 'vanaspati'], '🫙', 'from-amber-50 to-yellow-100'],
  [['sugar', 'cheeni'], '🍬', 'from-white to-gray-50'],
  [['salt', 'namak'], '🧂', 'from-gray-50 to-slate-100'],
  [['tea', 'chai', 'green tea'], '🍵', 'from-amber-50 to-green-100'],
  [['coffee', 'nescafe', 'bru'], '☕', 'from-amber-50 to-brown-100'],
  [['juice', 'lassi', 'buttermilk', 'nimbu pani'], '🧃', 'from-orange-50 to-yellow-100'],
  [['water', 'pani', 'bisleri'], '💧', 'from-blue-50 to-cyan-100'],
  [['cola', 'pepsi', 'coke', 'sprite', 'soda', 'fanta', 'limca'], '🥤', 'from-blue-50 to-indigo-100'],
  [['chips', 'lays', 'kurkure', 'snack', 'wafer', 'nachos'], '🍿', 'from-yellow-50 to-amber-100'],
  [['chocolate', 'choco', 'dairy milk', 'kitkat', 'oreo'], '🍫', 'from-brown-50 to-amber-100'],
  [['soap', 'sabun', 'handwash'], '🧼', 'from-blue-50 to-cyan-100'],
  [['shampoo', 'conditioner', 'hair'], '🧴', 'from-purple-50 to-violet-100'],
  [['toothpaste', 'colgate', 'pepsodent', 'closeup'], '🪥', 'from-green-50 to-teal-100'],
  [['detergent', 'surf', 'ariel', 'washing'], '🫧', 'from-blue-50 to-indigo-100'],
  [['sanitizer', 'dettol', 'savlon', 'antiseptic'], '🧴', 'from-green-50 to-emerald-100'],
  [['diaper', 'pampers', 'huggies'], '👶', 'from-blue-50 to-sky-100'],
];

const CATEGORY_EMOJI: Record<string, [string, string]> = {
  'dairy': ['🥛', 'from-blue-50 to-sky-100'],
  'dairy & bakery': ['🧀', 'from-amber-50 to-yellow-100'],
  'fruits': ['🍎', 'from-red-50 to-pink-100'],
  'fruits & vegetables': ['🥦', 'from-green-50 to-lime-100'],
  'vegetables': ['🥦', 'from-green-50 to-green-100'],
  'bakery': ['🍞', 'from-amber-50 to-yellow-100'],
  'snacks': ['🍿', 'from-yellow-50 to-amber-100'],
  'beverages': ['🥤', 'from-blue-50 to-indigo-100'],
  'grocery': ['🛒', 'from-green-50 to-emerald-100'],
  'household': ['🏠', 'from-blue-50 to-slate-100'],
  'personal care': ['🧴', 'from-purple-50 to-violet-100'],
  'meat & seafood': ['🥩', 'from-red-50 to-rose-100'],
  'frozen': ['🧊', 'from-cyan-50 to-blue-100'],
};

function getProductDisplay(product: any): { emoji: string; gradient: string } {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category?.name || '').toLowerCase();
  
  // Check name keywords first (more specific)
  for (const [keywords, emoji, gradient] of KEYWORD_EMOJI) {
    if (keywords.some(k => name.includes(k))) {
      return { emoji, gradient };
    }
  }
  
  // Fall back to category
  for (const [key, [emoji, gradient]] of Object.entries(CATEGORY_EMOJI)) {
    if (cat.includes(key)) {
      return { emoji, gradient };
    }
  }
  
  return { emoji: '🛍️', gradient: 'from-gray-50 to-slate-100' };
}

function formatExpiryDate(dateString: string) {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  
  // Strip time for accurate day calculation
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return <span className="bg-red-50 text-red-600 font-medium px-2.5 py-1 rounded-full">Expired {Math.abs(diffDays)} days ago</span>;
  } else if (diffDays === 0) {
    return <span className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full">Expires Today!</span>;
  } else if (diffDays === 1) {
    return <span className="bg-orange-50 text-orange-600 font-bold px-2.5 py-1 rounded-full">Expires Tomorrow</span>;
  } else if (diffDays <= 7) {
    return <span className="bg-orange-50 text-orange-600 font-medium px-2.5 py-1 rounded-full">Expires in {diffDays} days</span>;
  } else {
    return <span className="bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full">Exp: {expiry.toLocaleDateString()}</span>;
  }
}
// ────────────────────────────────────────────────────────────────────────────

export default function CustomerPortal() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [animatedProducts, setAnimatedProducts] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>({});
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<"PROFILE" | "HISTORY">("PROFILE");
  const [showNotifications, setShowNotifications] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"CART" | "PAYLOAD">("CART");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<"CART" | "LOCATION" | "PAYMENT">("CART");
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const ordersRes = await apiClient<any[]>("/api/orders", { requireAuth: true });
      if (ordersRes && Array.isArray(ordersRes)) setOrders(ordersRes);
    } catch (err) {}
  };

  const getETA = (status: string, orderedAt?: string) => {
    if (status === 'PLACED') return "Confirming order...";
    if (status === 'CONFIRMED') return "Accepting packing...";
    if (status === 'PACKING') return "Driver assigned, heading to store...";
    if (status === 'OUT_FOR_DELIVERY') {
      if (orderedAt) {
        const elapsedMinutes = Math.floor((new Date().getTime() - new Date(orderedAt).getTime()) / 60000);
        const remaining = Math.max(1, 15 - elapsedMinutes);
        return `Arriving in approx. ${remaining} min${remaining > 1 ? 's' : ''}`;
      }
      return "Arriving in approx. 12 mins";
    }
    return "";
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [prodData, catData, profileDataRes] = await Promise.all([
          apiClient<any[]>("/api/catalog/products", { requireAuth: true }),
          apiClient<any[]>("/api/catalog/categories", { requireAuth: true }),
          apiClient<any>("/api/profile", { requireAuth: true }),
        ]);
        setProducts(prodData);
        setCategories(catData);
        if (profileDataRes && profileDataRes.user) {
            if (profileDataRes.user.role !== "CUSTOMER") {
              alert(`You are a ${profileDataRes.user.role}, not a CUSTOMER.`);
              router.push("/auth");
              return;
            }
            setUser(profileDataRes.user);
            setProfileData(profileDataRes.user);
        }
        await fetchOrders();
      } catch (err) {
        console.error("Failed to fetch catalog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const activeOrder = orders.find(o => !['DELIVERED', 'CANCELLED'].includes(o.order_status));

  // Live Tracking Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeOrder && activeOrder.order_status !== 'DELIVERED') {
      interval = setInterval(fetchOrders, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeOrder?.order_status]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setAnimatedProducts(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAnimatedProducts(prev => ({ ...prev, [product.id]: false })), 1000);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    if (!user?.address || !user?.city || !user?.pincode) {
        alert("Please complete your delivery address in your profile before ordering.");
        setShowProfile(true);
        setEditMode(true);
        return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({ productId: item.id, quantity: item.qty, price: item.price }));
      await apiClient<{ success: boolean; order: any }>("/api/orders", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ items })
      });
      setCart([]);
      setOrderSuccess(true);
      setCheckoutStep("CART");
      fetchOrders();
    } catch (err: any) {
      alert("Failed to place order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (dataToUpdate?: any) => {
    // If dataToUpdate is a React event, ignore it
    const isEvent = dataToUpdate && dataToUpdate.nativeEvent;
    const data = (dataToUpdate && !isEvent) ? dataToUpdate : profileData;
    try {
      await apiClient("/api/profile", {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(data)
      });
      setUser({ ...user, ...data });
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      await apiClient(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
        requireAuth: true
      });
      // Immediately clear the order locally to make it feel fast
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, order_status: 'CANCELLED' } : o));
      await fetchOrders();
      setSidebarTab("CART");
      setCheckoutStep("CART");
    } catch (err: any) {
      alert("Failed to cancel order: " + err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory !== "ALL" && p.categoryId !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans selection:bg-yellow-200 selection:text-gray-900 pb-20 md:pb-0">
      
      {/* Main Content */}
      <div className="flex-1 pb-32">
        <header className="px-6 py-4 flex justify-between items-center border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur z-20 shadow-sm">
          <div>
            <h1 className="font-bold text-3xl tracking-tight text-yellow-500">Gronow</h1>
            <p className="text-xs text-gray-500 font-semibold flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Delivery in 15 minutes
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { localStorage.removeItem("gronow_token"); router.push("/"); }}
              className="text-xs text-red-500 hover:bg-red-50 font-semibold transition-colors px-3 py-1 rounded hidden sm:block"
            >
              Logout
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold shadow-sm hover:bg-gray-200 transition-colors"
              >
                🔔
                {activeOrder && (
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-white"></span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {activeOrder && (
                        <div className="p-4 border-b border-gray-50 bg-blue-50/30 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); setSidebarTab("PAYLOAD"); setIsSidebarOpen(true); }}>
                          <p className="text-xs font-bold text-blue-600 mb-1">Live Order Update</p>
                          <p className="text-sm font-semibold text-gray-900">Order {activeOrder.order_number}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{getETA(activeOrder.order_status, activeOrder.ordered_at)}</p>
                        </div>
                      )}
                      <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                         <p className="text-xs font-bold text-green-600 mb-1">Brand Promotion</p>
                         <p className="text-sm font-semibold text-gray-900">50% OFF on Dairy! 🥛</p>
                         <p className="text-xs text-gray-600 mt-0.5">Stock up on milk, cheese, and butter this weekend. Tap to explore.</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                         <p className="text-xs font-bold text-orange-600 mb-1">Flash Sale</p>
                         <p className="text-sm font-semibold text-gray-900">Fresh Fruits under ₹99 🍎</p>
                         <p className="text-xs text-gray-600 mt-0.5">Grab the freshest apples and bananas before they run out.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="hidden md:flex relative px-4 py-2 rounded-xl bg-green-600 text-white items-center justify-center font-bold shadow-md hover:bg-green-700 transition-colors"
            >
              My Cart
              {(cart.length > 0 || activeOrder) && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white"></span>
              )}
            </button>
            <button 
              onClick={() => setShowProfile(true)}
              className="hidden md:flex w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 items-center justify-center font-bold shadow-sm hover:bg-yellow-200 transition-colors"
            >
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </button>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="px-6 py-8 md:px-12 md:py-12 bg-yellow-400 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl">
            <h2 className="font-bold text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
              India's last minute app
            </h2>
            <p className="text-gray-800 text-lg max-w-xl font-medium">
              Fresh groceries, electronics, and daily essentials delivered right to your door in 15 minutes.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-6 md:px-12 py-4 border-b border-gray-200 bg-white flex gap-3 overflow-x-auto no-scrollbar whitespace-nowrap sticky top-[73px] z-10 shadow-sm">
           <button 
             onClick={() => setActiveCategory("ALL")}
             className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${activeCategory === "ALL" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
           >
             All Items
           </button>
           {categories.map(c => (
             <button 
               key={c.id}
               onClick={() => setActiveCategory(c.id)}
               className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${activeCategory === c.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
             >
               {c.name}
             </button>
           ))}
        </div>

        {/* Products Grid */}
        <section className="p-6 md:p-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400 font-semibold animate-pulse">Loading products...</div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {(() => { const { emoji, gradient } = getProductDisplay(product); return (
                  <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply p-3"
                        onError={(e: any) => { e.target.style.display='none'; }}
                      />
                    ) : (
                      <span className="text-6xl select-none" style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))'}}>{emoji}</span>
                    )}
                    <AnimatePresence>
                      {animatedProducts[product.id] && (
                        <motion.div
                          initial={{ opacity: 1, y: 0, scale: 1 }}
                          animate={{ opacity: 0, y: -50, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          className="absolute text-green-500 font-bold text-2xl drop-shadow-md z-10"
                        >
                          +1
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                        {product.discount_percentage}% OFF
                      </div>
                    )}
                  </div>
                  ); })()}
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm mb-0.5 leading-snug line-clamp-2">{product.name}</h3>
                    {product.category && <p className="text-xs text-gray-400 mb-3">{product.category.name}</p>}
                    
                    <div className="mt-auto flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 text-base">₹{product.price}</span>
                        {product.discount_percentage > 0 && (
                          <span className="text-xs text-gray-400 line-through ml-1">₹{Math.round(product.price / (1 - product.discount_percentage / 100))}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="bg-green-50 text-green-700 font-bold border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-sm"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] flex flex-col bg-gray-50 z-50 shadow-2xl"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-2xl z-50 bg-white/50 rounded-full w-8 h-8 flex items-center justify-center"
              >
                &times;
              </button>
        
              {/* Tabs */}
              <div className="flex bg-white shadow-sm z-10 relative">
                <button 
                  onClick={() => setSidebarTab("CART")}
                  className={`flex-1 py-4 font-bold text-sm transition-colors ${
                    sidebarTab === "CART" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  My Cart
                </button>
                <button 
                  onClick={() => setSidebarTab("PAYLOAD")}
                  className={`flex-1 py-4 font-bold text-sm transition-colors flex justify-center items-center gap-2 ${
                    sidebarTab === "PAYLOAD" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Live Tracking
                  {activeOrder && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm"></span>}
                </button>
              </div>

              {sidebarTab === "CART" ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {checkoutStep === "CART" && (
                      <AnimatePresence>
                        {cart.length === 0 ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">🛒</div>
                            <p className="text-gray-500 font-semibold">Your cart is empty</p>
                          </motion.div>
                        ) : (
                          cart.map((item) => (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                              key={item.id} 
                              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
                            >
                              <div>
                                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                <span className="text-xs text-gray-500">₹{item.price} x {item.qty}</span>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="font-bold text-lg text-gray-900">₹{item.price * item.qty}</span>
                                <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors">Remove</button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    )}

                    {checkoutStep === "LOCATION" && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Delivery Location</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{user?.address}</p>
                          <p className="text-sm text-gray-500">{user?.city}, {user?.state} {user?.pincode}</p>
                          <p className="text-sm text-gray-500 mt-2">📞 {user?.phone_number}</p>
                        </div>
                        <button onClick={() => { setShowProfile(true); setEditMode(true); }} className="text-green-600 font-semibold text-sm hover:underline">Edit Address</button>
                      </motion.div>
                    )}

                    {checkoutStep === "PAYMENT" && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Payment Method</h3>
                        
                        <label className="flex items-center gap-4 p-4 border-2 border-green-500 bg-green-50 rounded-xl cursor-pointer">
                          <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-green-600 focus:ring-green-500" />
                          <div className="flex-1">
                            <h4 className="font-bold text-green-800">UPI / QR</h4>
                            <p className="text-xs text-green-600 mt-0.5">Pay via Google Pay, PhonePe, Paytm</p>
                          </div>
                          <span className="text-2xl">📱</span>
                        </label>
                        
                        <label className="flex items-center gap-4 p-4 border border-gray-200 bg-white rounded-xl opacity-50 cursor-not-allowed">
                          <input type="radio" name="payment" disabled className="w-5 h-5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">Credit / Debit Card</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Coming soon</p>
                          </div>
                          <span className="text-2xl">💳</span>
                        </label>

                        <label className="flex items-center gap-4 p-4 border border-gray-200 bg-white rounded-xl opacity-50 cursor-not-allowed">
                          <input type="radio" name="payment" disabled className="w-5 h-5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">Cash on Delivery</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Not available for this location</p>
                          </div>
                          <span className="text-2xl">💵</span>
                        </label>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 font-semibold text-sm">To Pay</span>
                      <span className="font-bold text-2xl text-gray-900">₹{total}</span>
                    </div>
                    {checkoutStep === "CART" && (
                      <button 
                        onClick={() => setCheckoutStep("LOCATION")}
                        disabled={cart.length === 0 || loading || !!activeOrder}
                        className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? "Loading..." : activeOrder ? "Finish Active Order" : "Choose Location"}
                      </button>
                    )}
                    {checkoutStep === "LOCATION" && (
                      <div className="flex gap-2">
                        <button onClick={() => setCheckoutStep("CART")} className="w-1/3 bg-gray-100 text-gray-700 font-bold text-lg py-4 rounded-xl hover:bg-gray-200 transition-colors">Back</button>
                        <button 
                          onClick={() => {
                            if (!profileData.address || !profileData.pincode) {
                              alert("Please fill in your address details");
                              return;
                            }
                            const updatedProfile = { ...profileData, state: profileData.state || "Odisha" };
                            setProfileData(updatedProfile);
                            updateProfile(updatedProfile).then(() => setCheckoutStep("PAYMENT"));
                          }}
                          className="w-2/3 bg-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-green-700 transition-colors"
                        >Select Payment</button>
                      </div>
                    )}
                    {checkoutStep === "PAYMENT" && (
                      <div className="flex gap-2">
                        <button onClick={() => setCheckoutStep("LOCATION")} className="w-1/3 bg-gray-100 text-gray-700 font-bold text-lg py-4 rounded-xl hover:bg-gray-200 transition-colors">Back</button>
                        <button onClick={() => { placeOrder(); setSidebarTab("PAYLOAD"); }} className="w-2/3 bg-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-green-700 transition-colors">{loading ? "Processing..." : "Place Order"}</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50">
                  {activeOrder ? (
                    <div className="w-full h-full flex flex-col">
                      <div className="bg-white p-6 shadow-sm z-10 text-center border-b border-gray-100">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">Live Status</h3>
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                          {activeOrder.order_status}
                        </span>
                        <p className="text-sm font-bold text-green-600 animate-pulse">{getETA(activeOrder.order_status, activeOrder.ordered_at)}</p>
                      </div>
                      
                      {/* Map Section */}
                      {['PLACED', 'CONFIRMED'].includes(activeOrder.order_status) ? (
                        <div className="p-8 text-center text-gray-400 font-medium bg-white border-b border-gray-100 h-64 flex flex-col items-center justify-center bg-gray-50">
                           <div className="text-4xl mb-3">🏪</div>
                           Store is preparing your order.<br/><span className="text-xs mt-1">Map will appear once driver is assigned.</span>
                        </div>
                      ) : activeRouteWaypoints(activeOrder) ? (
                        <div className="h-64 w-full relative z-0 bg-gray-200">
                          <RouteMap 
                            waypoints={activeRouteWaypoints(activeOrder)} 
                            riderLocation={activeOrder.latitude ? { lat: parseFloat(activeOrder.latitude), lng: parseFloat(activeOrder.longitude) } : undefined}
                            lightMode={true} 
                          />
                        </div>
                      ) : activeOrder.latitude && activeOrder.longitude ? (
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl shadow-inner">🏍️</div>
                          <div>
                            <span className="text-green-600 font-bold text-sm block mb-1">Driver on the way</span>
                            <span className="text-xs text-gray-500">Telemetry active</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-400 font-medium bg-white border-b border-gray-100 h-64 flex items-center justify-center bg-gray-50">
                          Waiting for GPS telemetry...
                        </div>
                      )}

                      <div className="p-6 bg-white flex-1">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-gray-500 font-medium text-sm">Order #{activeOrder.order_number}</span>
                          <span className="font-bold text-gray-900">₹{activeOrder.total_amount}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                          <motion.div 
                            className="h-full bg-green-500"
                            initial={{ width: "0%" }}
                            animate={{ 
                              width: activeOrder.order_status === 'PLACED' ? "20%" : 
                                     activeOrder.order_status === 'CONFIRMED' ? "40%" :
                                     activeOrder.order_status === 'PACKING' ? "60%" :
                                     activeOrder.order_status === 'OUT_FOR_DELIVERY' ? "90%" : "100%" 
                            }}
                            transition={{ duration: 1 }}
                          />
                        </div>

                        {activeOrder.order_status === 'PLACED' && (
                          <button 
                            onClick={() => cancelOrder(activeOrder.order_id)}
                            className="w-full mt-4 bg-white border border-red-200 text-red-500 font-bold text-sm py-3 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-4">📦</div>
                      <p className="text-gray-500 font-semibold">No active orders</p>
                    </div>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
            >
              {/* Product Image */}
              {(() => { const { emoji, gradient } = getProductDisplay(selectedProduct); return (
              <div className={`relative h-52 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain mix-blend-multiply p-6"
                    onError={(e: any) => { e.target.style.display='none'; }}
                  />
                ) : (
                  <span className="text-8xl select-none" style={{filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))'}}>{emoji}</span>
                )}
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-600 font-bold shadow-sm hover:bg-white transition-colors">×</button>
                {selectedProduct.discount_percentage > 0 && (
                  <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {selectedProduct.discount_percentage}% OFF
                  </div>
                )}
              </div>
              ); })()}

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">{selectedProduct.name}</h2>
                    {selectedProduct.category && <p className="text-sm text-gray-400 mt-0.5">{selectedProduct.category.name}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-2xl text-gray-900">₹{selectedProduct.price}</p>
                    {selectedProduct.discount_percentage > 0 && (
                      <p className="text-sm text-gray-400 line-through">₹{Math.round(selectedProduct.price / (1 - selectedProduct.discount_percentage / 100))}</p>
                    )}
                  </div>
                </div>

                {selectedProduct.description && (
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{selectedProduct.description}</p>
                )}

                <div className="flex gap-2 text-xs mb-5">
                  {selectedProduct.brand && (
                    <span className="bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">🏷️ {selectedProduct.brand}</span>
                  )}
                  {selectedProduct.unit && (
                    <span className="bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">⚖️ {selectedProduct.unit}</span>
                  )}
                  {formatExpiryDate(selectedProduct.expiry_date)}
                </div>

                <button
                  onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors text-base shadow-lg shadow-green-100"
                >
                  Add to Cart — ₹{selectedProduct.price}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Success Screen */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-600 z-[100] flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-white text-green-600 flex items-center justify-center mb-6 shadow-2xl text-4xl"
            >
              ✓
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="font-bold text-4xl md:text-5xl mb-4"
            >
              Order Placed!
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-green-100 max-w-sm mb-12 text-lg font-medium"
            >
              We've received your order and are finding the nearest driver. Prepare for 15-minute magic.
            </motion.p>
            
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              onClick={() => { setOrderSuccess(false); setSidebarTab("PAYLOAD"); setIsSidebarOpen(true); }}
              className="bg-white text-green-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
            >
              Track Order
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <h3 className="font-bold text-xl text-gray-900">Your Account</h3>
                <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
              </div>
              
              <div className="flex border-b border-gray-100 bg-white shrink-0">
                 <button 
                   onClick={() => setProfileTab('PROFILE')}
                   className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${profileTab === 'PROFILE' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                 >Profile Details</button>
                 <button 
                   onClick={() => setProfileTab('HISTORY')}
                   className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${profileTab === 'HISTORY' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                 >Order History</button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto overflow-x-hidden relative flex-1">
                {profileTab === 'PROFILE' ? (
                  <>
                    <div className="space-y-4">
                      {editMode ? (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">FIRST NAME</label>
                            <input 
                              type="text" 
                              value={profileData.first_name || ""} 
                              onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">LAST NAME</label>
                            <input 
                              type="text" 
                              value={profileData.last_name || ""} 
                              onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">PHONE NUMBER</label>
                            <input 
                              type="text" 
                              value={profileData.phone_number || ""} 
                              onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ADDRESS</label>
                            <input 
                              type="text" 
                              value={profileData.address || ""} 
                              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">CITY</label>
                              <input 
                                type="text" 
                                value={profileData.city || ""} 
                                onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">STATE</label>
                              <input 
                                type="text" 
                                value={profileData.state || ""} 
                                onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">PINCODE</label>
                            <input 
                              type="text" 
                              value={profileData.pincode || ""} 
                              onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold mb-1">FULL NAME</p>
                            <p className="font-semibold text-gray-900">{profileData.first_name} {profileData.last_name}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold mb-1">CONTACT</p>
                            <p className="font-semibold text-gray-900">{profileData.phone_number || "Not provided"}</p>
                            <p className="font-semibold text-gray-500 text-sm">{profileData.email}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold mb-1">DELIVERY ADDRESS</p>
                            <p className="font-semibold text-gray-900">
                              {profileData.address ? (
                                <>{profileData.address}<br/>{profileData.city}, {profileData.state} {profileData.pincode}</>
                              ) : (
                                <span className="text-orange-500 text-sm">Please update your address</span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                      {editMode ? (
                        <>
                          <button onClick={() => setEditMode(false)} className="flex-1 px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                          <button onClick={updateProfile} className="flex-1 px-4 py-2 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm">Save Details</button>
                        </>
                      ) : (
                        <button onClick={() => setEditMode(true)} className="w-full px-4 py-3 rounded-xl font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 transition-colors">Edit Profile Details</button>
                      )}
                    </div>
                  </>
                ) : (
                   <div className="space-y-4">
                     {orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.order_status)).length > 0 ? (
                       orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.order_status)).map(order => (
                         <div key={order.order_id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                           <div className="flex justify-between items-start mb-2">
                             <div>
                               <p className="font-bold text-sm text-gray-900">{order.order_number}</p>
                               <p className="text-xs text-gray-500">{new Date(order.ordered_at).toLocaleDateString()} at {new Date(order.ordered_at).toLocaleTimeString()}</p>
                             </div>
                             <span className={`px-2 py-1 rounded text-[10px] font-bold ${order.order_status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {order.order_status}
                             </span>
                           </div>
                           <p className="text-sm font-semibold text-gray-900 mt-3">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-8 text-gray-400">
                         <p className="text-4xl mb-2">🧾</p>
                         <p className="text-sm font-medium">No past orders yet</p>
                       </div>
                     )}
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40 px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setIsSidebarOpen(false); setShowProfile(false); window.scrollTo(0,0); }}
          className="flex flex-col items-center justify-center w-full h-full text-green-600"
        >
          <span className="text-xl mb-0.5">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="relative flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-green-600"
        >
          <div className="relative">
            <span className="text-xl mb-0.5">🛒</span>
            {(cart.length > 0 || activeOrder) && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </button>

        <button 
          onClick={() => setShowProfile(true)}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-green-600"
        >
          <span className="text-xl mb-0.5">👤</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

    </div>
  );
}

// Helper
function activeRouteWaypoints(activeOrder: any) {
  if (!activeOrder || !activeOrder.route_waypoints) return null;
  return typeof activeOrder.route_waypoints === 'string' ? JSON.parse(activeOrder.route_waypoints) : activeOrder.route_waypoints;
}
