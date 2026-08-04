"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function StorePortal() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [storeProfile, setStoreProfile] = useState<any>({});
  const router = useRouter();

  const [storeForm, setStoreForm] = useState({
    shop_name: "", description: "", address: "", city: "", state: "", pincode: "", contact_number: "",
    latitude: "20.296059", longitude: "85.824539", opening_time: "08:00:00", closing_time: "22:00:00"
  });

  const [newProduct, setNewProduct] = useState({
    product_name: "", category_id: "", unit: "kg", price: "", sku: "", expiry_date: ""
  });

  // Edit product
  const [editingProduct, setEditingProduct] = useState<any>(null); // holds the item being edited
  const [editProductForm, setEditProductForm] = useState({ product_name: "", price: "", unit: "", description: "", discount_percentage: "", expiry_date: "" });

  // Keep track of order count to notify on new orders
  const previousOrderCount = useRef(0);

  const fetchOrders = async () => {
    if (!hasStore) return;
    try {
      const ordersData = await apiClient<any[]>("/api/stores/orders", { requireAuth: true }).catch(() => []);
      setActiveOrders(ordersData || []);
      
      // Notify if new order arrived
      if (ordersData && ordersData.length > previousOrderCount.current && previousOrderCount.current > 0) {
        // simple beep
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'); // dummy short beep for example, or we can just rely on visual, but let's just use alert or visual instead
        // Since Audio needs a real source, let's just trigger a browser notification if permitted
        if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
          new Notification("New Order Arrived!", { body: "Check the active orders tab." });
        }
      }
      if (ordersData) {
        previousOrderCount.current = ordersData.length;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await apiClient<any>("/api/stores/profile", { requireAuth: true });
        
        if (!profileRes.hasStore) {
          setHasStore(false);
          setLoading(false);
          return;
        }

        setStoreProfile(profileRes.store);
        // Also populate the form in case they want to edit
        setStoreForm(profileRes.store);

        const [invData, catData] = await Promise.all([
          apiClient<any[]>("/api/inventory", { requireAuth: true }).catch(() => []),
          apiClient<any[]>("/api/catalog/categories", { requireAuth: true })
        ]);
        setInventory(invData);
        setCategories(catData);
        await fetchOrders();
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hasStore]);

  // Polling for new orders
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasStore) {
      interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStore]);

  // Request Notification Permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient("/api/stores", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          ...storeForm,
          latitude: parseFloat(storeForm.latitude as string),
          longitude: parseFloat(storeForm.longitude as string)
        })
      });
      setHasStore(true);
      // Re-fetch profile
      const profileRes = await apiClient<any>("/api/stores/profile", { requireAuth: true });
      if (profileRes.store) {
          setStoreProfile(profileRes.store);
      }
    } catch (err: any) {
      alert("Error creating store: " + err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient("/api/stores/profile", {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({
          ...storeForm,
          latitude: parseFloat(storeForm.latitude as string),
          longitude: parseFloat(storeForm.longitude as string)
        })
      });
      setStoreProfile(storeForm);
      setEditMode(false);
      alert("Store Profile updated successfully!");
    } catch (err: any) {
      alert("Failed to update store profile: " + err.message);
    }
  };

  const handleEditProduct = (item: any) => {
    setEditingProduct(item);
    setEditProductForm({
      product_name: item.product_name || "",
      price: item.price || "",
      unit: item.unit || "",
      description: item.description || "",
      discount_percentage: item.discount_percentage || "",
      expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : ""
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await apiClient(`/api/products/${editingProduct.product_id}`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(editProductForm)
      });
      // Reload inventory
      const invData = await apiClient<any[]>("/api/inventory", { requireAuth: true });
      setInventory(invData);
      setEditingProduct(null);
    } catch (err: any) {
      alert("Failed to update product: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await apiClient(`/api/products/${productId}`, { method: "DELETE", requireAuth: true });
      const invData = await apiClient<any[]>("/api/inventory", { requireAuth: true });
      setInventory(invData);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.product_name || !newProduct.category_id || !newProduct.price) {
      return alert("Missing required fields");
    }
    try {
      const res = await apiClient<any>("/api/products", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify(newProduct)
      });
      alert("Product added successfully!");
      setShowAddForm(false);
      // Reload inventory
      const invData = await apiClient<any[]>("/api/inventory", { requireAuth: true });
      setInventory(invData);
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    }
  };

  const updateQuantity = async (inventory_id: number, quantity: number) => {
    try {
      await apiClient(`/api/inventory/${inventory_id}`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({ available_quantity: quantity })
      });
      // Update local state
      setInventory(prev => prev.map(item => item.inventory_id === inventory_id ? { ...item, available_quantity: quantity } : item));
    } catch (err: any) {
      alert("Failed to update stock: " + err.message);
    }
  };

  const updateOrderStatus = async (order_id: number, new_status: string) => {
    try {
      await apiClient(`/api/stores/orders/${order_id}/status`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({ status: new_status })
      });
      // Re-fetch orders to reflect new status (and to remove it if it goes beyond OUT_FOR_DELIVERY)
      const ordersData = await apiClient<any[]>("/api/stores/orders", { requireAuth: true });
      setActiveOrders(ordersData || []);
    } catch (err: any) {
      alert("Failed to update order status: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center font-mono">LOADING...</div>;

  if (!hasStore) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-body">
        <div className="w-full max-w-xl bg-white border border-gray-200 p-8 text-gray-900">
          <h2 className="font-display font-black text-3xl mb-6 uppercase text-gray-900">Initialize Store Node</h2>
          <p className="font-mono text-xs text-gray-600 mb-8 tracking-widest uppercase border-l-2 border-green-600 pl-4">
            Connect your physical inventory to the grid. Provide store telemetry.
          </p>
          
          <form onSubmit={handleCreateStore} className="space-y-4 font-mono text-sm">
            <input required placeholder="Shop Name" value={storeForm.shop_name} onChange={e => setStoreForm({...storeForm, shop_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            <input placeholder="Short Description" value={storeForm.description} onChange={e => setStoreForm({...storeForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            <input required placeholder="Contact Number (10 Digits)" value={storeForm.contact_number} onChange={e => setStoreForm({...storeForm, contact_number: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="City" value={storeForm.city} onChange={e => setStoreForm({...storeForm, city: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
              <input required placeholder="State" value={storeForm.state} onChange={e => setStoreForm({...storeForm, state: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            </div>
            
            <input required placeholder="Full Address" value={storeForm.address} onChange={e => setStoreForm({...storeForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            <input required placeholder="Pincode" value={storeForm.pincode} onChange={e => setStoreForm({...storeForm, pincode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" step="0.00000001" placeholder="Latitude" value={storeForm.latitude} onChange={e => setStoreForm({...storeForm, latitude: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
              <input required type="number" step="0.00000001" placeholder="Longitude" value={storeForm.longitude} onChange={e => setStoreForm({...storeForm, longitude: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input required type="time" placeholder="Opening Time" value={storeForm.opening_time} onChange={e => setStoreForm({...storeForm, opening_time: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
              <input required type="time" placeholder="Closing Time" value={storeForm.closing_time} onChange={e => setStoreForm({...storeForm, closing_time: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
            </div>
            
            <button type="submit" className="w-full bg-green-600 text-black font-display font-bold py-4 mt-8 hover:bg-white transition-colors uppercase">
              Activate Store Node
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">G</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">Gronow Store Portal</h1>
            <p className="text-xs text-green-600 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Network Online
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg font-medium">
            Uptime: 99.9%
          </div>
          <button 
            onClick={() => setShowProfile(true)}
            className="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors border border-gray-200 hover:border-green-300 px-4 py-2 rounded-xl bg-white shadow-sm"
          >
            ⚙️ Store Config
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("gronow_token");
              router.push("/");
            }}
            className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl bg-white shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* Left Column: Inventory Ledger */}
        <div className="xl:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl text-gray-900">Live Inventory</h2>
              <p className="text-sm text-gray-500">{inventory.length} products</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="text-sm font-semibold bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <span>+</span> Add Product
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold tracking-wide">Status</th>
                  <th className="px-4 py-3 font-semibold tracking-wide">Product</th>
                  <th className="px-4 py-3 font-semibold tracking-wide">Price</th>
                  <th className="px-4 py-3 font-semibold tracking-wide text-right">Qty</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-gray-100"
                initial="hidden" animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
                }}
              >
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-green-600 text-sm animate-pulse">
                      Loading inventory...
                    </td>
                  </tr>
                ) : inventory.length > 0 ? (
                  inventory.map((item) => (
                    <motion.tr 
                      key={item.inventory_id} 
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.stock_status === 'IN_STOCK' ? 'bg-green-50 text-green-700' :
                          item.stock_status === 'LOW_STOCK' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.stock_status === 'IN_STOCK' ? 'bg-green-500' :
                            item.stock_status === 'LOW_STOCK' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          {item.stock_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.product_name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{item.sku || `PRD-${item.product_id}`} · {item.unit}</p>
                          {/* Inline edit/delete — always visible */}
                          <div className="flex gap-2 mt-1.5">
                            <button
                              onClick={() => handleEditProduct(item)}
                              className="text-[11px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.product_id)}
                              className="text-[11px] bg-red-50 text-red-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <input 
                          type="number" 
                          value={item.available_quantity} 
                          onChange={(e) => updateQuantity(item.inventory_id, parseInt(e.target.value) || 0)}
                          className="bg-gray-50 border border-gray-200 text-green-700 font-semibold text-right w-20 px-2 py-1.5 rounded-lg outline-none focus:border-green-500 text-sm"
                        />
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl">📦</span>
                        <p className="font-medium">No products yet</p>
                        <p className="text-xs">Click "Add Product" to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </div>        {/* Right Column: Active Dispatches */}
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-xl text-gray-900">Active Orders</h2>
            <p className="text-sm text-gray-500">{activeOrders.length} pending</p>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <motion.div 
                    key={order.order_id} 
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                  >
                     <div className="flex justify-between items-center mb-3">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                         order.order_status === 'PLACED' ? 'bg-blue-50 text-blue-700' :
                         order.order_status === 'CONFIRMED' ? 'bg-yellow-50 text-yellow-700' :
                         order.order_status === 'PACKING' ? 'bg-orange-50 text-orange-700' :
                         'bg-green-50 text-green-700'
                       }`}>{order.order_status}</span>
                       <span className="text-xs text-gray-400">{new Date(order.ordered_at).toLocaleTimeString()}</span>
                     </div>
                     <p className="font-bold text-gray-900 mb-0.5">{order.order_number}</p>
                     <p className="text-xs text-gray-500 mb-4">{order.first_name} {order.last_name} • {order.city}</p>
                     
                     <div className="flex gap-2">
                       <div className="flex-none border border-gray-200 text-gray-700 font-bold py-2 px-3 rounded-xl text-sm">
                         ₹{order.total_amount}
                       </div>
                       
                       {order.order_status === 'PLACED' && (
                         <motion.button 
                           whileTap={{ scale: 0.97 }}
                           onClick={() => updateOrderStatus(order.order_id, 'CONFIRMED')}
                           className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl hover:bg-green-700 transition-colors text-sm"
                         >
                           Accept Order
                         </motion.button>
                       )}
                       
                       {order.order_status === 'CONFIRMED' && (
                         <motion.button 
                           whileTap={{ scale: 0.97 }}
                           onClick={() => updateOrderStatus(order.order_id, 'PACKING')}
                           className="flex-1 bg-yellow-500 text-white font-bold py-2 rounded-xl hover:bg-yellow-600 transition-colors text-sm"
                         >
                           Start Packing
                         </motion.button>
                       )}
                       
                       {order.order_status === 'PACKING' && (
                         <motion.button 
                           whileTap={{ scale: 0.97 }}
                           onClick={() => updateOrderStatus(order.order_id, 'OUT_FOR_DELIVERY')}
                           className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                         >
                           Hand to Driver
                         </motion.button>
                       )}
    
                       {order.order_status === 'OUT_FOR_DELIVERY' && (
                         <button 
                           disabled
                           className="flex-1 bg-gray-100 text-gray-400 font-bold py-2 rounded-xl text-sm cursor-not-allowed"
                         >
                           En Route...
                         </button>
                       )}
                     </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-semibold text-gray-700 text-sm">No active orders</p>
                  <p className="text-xs text-gray-400 mt-1">Awaiting customer orders...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>


      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-2xl text-gray-900">Add New Product</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Fill in the product details</p>
                </div>
                <button onClick={() => setShowAddForm(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-xl">×</button>
              </div>
              
              {/* Modal Body */}
              <div className="px-7 py-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Product Name</label>
                  <input type="text" value={newProduct.product_name} onChange={e => setNewProduct({...newProduct, product_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" placeholder="e.g. Fresh Tomatoes" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Category</label>
                  <select value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all appearance-none">
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Unit</label>
                    <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all appearance-none">
                      {['kg','g','litre','ml','packet','piece','dozen'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Price (₹)</label>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">SKU <span className="text-gray-300 font-normal">(Optional)</span></label>
                    <input type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" placeholder="Auto-generated if left blank" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Expiry Date <span className="text-gray-300 font-normal">(Optional)</span></label>
                    <input type="date" value={newProduct.expiry_date} onChange={e => setNewProduct({...newProduct, expiry_date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" />
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-7 pb-7 pt-2">
                <button onClick={handleAddProduct} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl hover:bg-green-700 transition-colors text-sm tracking-wide shadow-lg shadow-green-100">
                  Create &amp; Add to Inventory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white border border-gray-200 w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Node Configuration</h2>
                <button onClick={() => { setShowProfile(false); setEditMode(false); }} className="text-gray-600 hover:text-gray-900 font-mono text-xl">✕</button>
              </div>

              {!editMode ? (
                <div className="space-y-6">
                  <div className="border border-gray-200 bg-white p-6">
                    <p className="font-mono text-[10px] text-green-600 tracking-widest mb-4">STORE IDENTITY</p>
                    <p className="font-display font-bold text-xl text-gray-900 mb-1">{storeProfile?.shop_name || "N/A"}</p>
                    <p className="font-mono text-xs text-gray-600">{storeProfile?.description || "No description provided."}</p>
                  </div>
                  
                  <div className="border border-gray-200 bg-white p-6">
                    <p className="font-mono text-[10px] text-green-600 tracking-widest mb-4">LOCATION & TELEMETRY</p>
                    <p className="font-mono text-sm text-gray-900 mb-2">{storeProfile?.address}</p>
                    <p className="font-mono text-sm text-gray-900 mb-4">{storeProfile?.city}, {storeProfile?.state} - {storeProfile?.pincode}</p>
                    <div className="flex gap-4">
                      <div className="bg-gray-50 px-3 py-1 font-mono text-xs text-gray-600">LAT: {storeProfile?.latitude}</div>
                      <div className="bg-gray-50 px-3 py-1 font-mono text-xs text-gray-600">LON: {storeProfile?.longitude}</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 bg-white p-6">
                    <p className="font-mono text-[10px] text-green-600 tracking-widest mb-4">OPERATIONAL METRICS</p>
                    <div className="grid grid-cols-2 gap-4 font-mono text-sm text-gray-900">
                      <div>
                        <span className="text-gray-600 text-xs block mb-1">CONTACT</span>
                        {storeProfile?.contact_number}
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs block mb-1">HOURS</span>
                        {storeProfile?.opening_time} - {storeProfile?.closing_time}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => { setStoreForm(storeProfile); setEditMode(true); }} className="w-full border border-green-600 text-green-600 hover:bg-green-600 hover:text-black transition-colors font-display font-bold py-3 uppercase">
                    Modify Configuration
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4 font-mono text-sm">
                  <input required placeholder="Shop Name" value={storeForm.shop_name} onChange={e => setStoreForm({...storeForm, shop_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  <input placeholder="Short Description" value={storeForm.description} onChange={e => setStoreForm({...storeForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  <input required placeholder="Contact Number" value={storeForm.contact_number} onChange={e => setStoreForm({...storeForm, contact_number: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="City" value={storeForm.city} onChange={e => setStoreForm({...storeForm, city: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                    <input required placeholder="State" value={storeForm.state} onChange={e => setStoreForm({...storeForm, state: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  </div>
                  
                  <input required placeholder="Full Address" value={storeForm.address} onChange={e => setStoreForm({...storeForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  <input required placeholder="Pincode" value={storeForm.pincode} onChange={e => setStoreForm({...storeForm, pincode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="number" step="0.00000001" placeholder="Latitude" value={storeForm.latitude} onChange={e => setStoreForm({...storeForm, latitude: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                    <input required type="number" step="0.00000001" placeholder="Longitude" value={storeForm.longitude} onChange={e => setStoreForm({...storeForm, longitude: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input required type="time" placeholder="Opening Time" value={storeForm.opening_time} onChange={e => setStoreForm({...storeForm, opening_time: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                    <input required type="time" placeholder="Closing Time" value={storeForm.closing_time} onChange={e => setStoreForm({...storeForm, closing_time: e.target.value})} className="bg-gray-50 border border-gray-200 p-4 focus:border-green-600 outline-none text-gray-900" />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-green-600 text-black font-display font-bold py-3 uppercase hover:bg-white transition-colors">Save</button>
                    <button type="button" onClick={() => setEditMode(false)} className="flex-1 border border-gray-200 text-gray-600 font-display font-bold py-3 uppercase hover:text-gray-900 transition-colors">Cancel</button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-2xl text-gray-900">Edit Product</h2>
                  <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xs">{editingProduct.product_name}</p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-xl">×</button>
              </div>
              <div className="px-7 py-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Product Name</label>
                  <input type="text" value={editProductForm.product_name} onChange={e => setEditProductForm({...editProductForm, product_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Price (₹)</label>
                    <input type="number" value={editProductForm.price} onChange={e => setEditProductForm({...editProductForm, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Discount %</label>
                    <input type="number" value={editProductForm.discount_percentage} onChange={e => setEditProductForm({...editProductForm, discount_percentage: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Unit</label>
                    <select value={editProductForm.unit} onChange={e => setEditProductForm({...editProductForm, unit: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all appearance-none">
                      {['kg','g','litre','ml','packet','piece','dozen'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Expiry Date <span className="text-gray-300 font-normal">(Optional)</span></label>
                    <input type="date" value={editProductForm.expiry_date} onChange={e => setEditProductForm({...editProductForm, expiry_date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Description</label>
                  <textarea value={editProductForm.description} onChange={e => setEditProductForm({...editProductForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none" rows={2} />
                </div>
              </div>
              <div className="px-7 pb-7 pt-2 flex gap-3">
                <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={handleUpdateProduct} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-2xl hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-100">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
