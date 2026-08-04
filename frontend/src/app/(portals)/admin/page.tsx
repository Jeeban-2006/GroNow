"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPortal() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [metrics, setMetrics] = useState<any>({ revenue: 0, orders: 0, customers: 0, active_stores: 0 });
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ base_delivery_fee: 15, surge_multiplier: 1, platform_commission_percent: 5 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SYSTEM METRICS");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsData, storesData, fleetData, ordersData, nodesData, configData] = await Promise.all([
        apiClient<any>("/api/admin/metrics", { requireAuth: true }),
        apiClient<any[]>("/api/admin/stores/pending", { requireAuth: true }).catch(() => []),
        apiClient<any[]>("/api/admin/fleet", { requireAuth: true }).catch(() => []),
        apiClient<any[]>("/api/admin/orders", { requireAuth: true }).catch(() => []),
        apiClient<any[]>("/api/admin/nodes", { requireAuth: true }).catch(() => []),
        apiClient<any>("/api/admin/config", { requireAuth: true }).catch(() => null)
      ]);
      if (metricsData && metricsData.success) {
        setMetrics(metricsData);
      }
      setPendingStores(storesData || []);
      setFleet(fleetData || []);
      setOrders(ordersData || []);
      setNodes(nodesData || []);
      if (configData) setConfig(configData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyStore = async (store_id: number) => {
    try {
      await apiClient(`/api/admin/stores/${store_id}/verify`, {
        method: "PUT",
        requireAuth: true
      });
      fetchData(); // refresh data
    } catch (err: any) {
      alert("Failed to verify store: " + err.message);
    }
  };

  const toggleNodeStatus = async (user_id: number) => {
    try {
      await apiClient(`/api/admin/nodes/${user_id}/status`, {
        method: "PUT",
        requireAuth: true
      });
      fetchData(); // refresh data
    } catch (err: any) {
      alert("Failed to toggle node status: " + err.message);
    }
  };

  const updateConfig = async () => {
    try {
      await apiClient(`/api/admin/config`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(config)
      });
      alert("Configuration updated successfully");
    } catch (err: any) {
      alert("Failed to update config: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 cursor-pointer" onClick={() => router.push('/')}>
          <h1 className="font-bold text-3xl tracking-tight text-yellow-500">Gronow</h1>
          <p className="font-bold text-[10px] text-green-600 uppercase tracking-widest mt-1">Admin Node</p>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {["SYSTEM METRICS", "FLEET TRACKING", "NODE MANAGEMENT", "ORDER LEDGER", "PRICING ENGINE"].map((item) => (
              <li key={item}>
                <button 
                  onClick={() => setActiveTab(item)} 
                  className={`w-full text-left block px-6 py-3 font-bold text-xs tracking-widest transition-colors ${
                  activeTab === item ? "bg-green-50 text-green-700 border-l-4 border-green-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-gray-200">
          <button 
            onClick={() => {
              localStorage.removeItem("gronow_token");
              router.push("/");
            }}
            className="w-full font-bold text-xs text-red-500 border border-red-100 bg-red-50 py-3 rounded-lg hover:bg-red-100 transition-colors"
          >
            TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        
        {/* Header Stats */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="font-extrabold text-3xl text-gray-900 tracking-tight mb-2">Admin Dashboard</h2>
            <div className="font-bold text-xs text-gray-600 flex items-center gap-4">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ALL SYSTEMS NOMINAL</span>
              <span>|</span>
              <span>{currentTime}</span>
            </div>
          </div>
          <div className="flex gap-4">
             <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => alert("Admin invite link generated: https://gronow.app/auth?invite=x82f9\n\n(Copied to clipboard)")}
               className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
             >
               + NEW ADMIN INVITE
             </motion.button>
          </div>
        </header>

        {activeTab === "SYSTEM METRICS" ? (
          <>
            {/* KPI Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              initial="hidden" animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {[
                { label: "TOTAL REVENUE", value: `₹${metrics.revenue || 0}`, color: "text-green-400" },
                { label: "TOTAL ORDERS", value: metrics.orders || 0, color: "text-gray-900" },
                { label: "CUSTOMERS", value: metrics.customers || 0, color: "text-gray-900" },
                { label: "ACTIVE STORES", value: metrics.active_stores || 0, color: "text-yellow-600" },
              ].map((kpi, i) => (
                <motion.div 
                  key={i} 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
                >
                  <p className="font-bold text-[10px] text-gray-600 mb-2 tracking-widest uppercase">{kpi.label}</p>
                  <div className="flex justify-between items-end">
                    <span className={`font-extrabold text-3xl ${kpi.color}`}>{loading ? '...' : kpi.value}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Chart */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="font-extrabold text-lg text-gray-900 uppercase tracking-tight">Throughput (Last 24h)</h3>
                  <div className="font-bold text-[10px] text-green-600 animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full inline-block"></span>
                    LIVE TELEMETRY ACTIVE
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl h-64 p-6 relative overflow-hidden shadow-sm">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-20">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-full border-b border-gray-200"></div>)}
                  </div>

                  {/* Animated SVG Chart */}
                  <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <motion.path 
                      d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,20 L80,30 L90,10 L100,5" 
                      fill="none" 
                      stroke="#FFC800" 
                      strokeWidth="2" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,20 L80,30 L90,10 L100,5" 
                      fill="url(#gradient)"
                      opacity="0.2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFC800" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    
                    {/* Data Points */}
                    {[
                      {x:10, y:75}, {x:30, y:60}, {x:50, y:40}, {x:70, y:20}, {x:90, y:10}
                    ].map((p, i) => (
                      <motion.circle 
                        key={i} cx={p.x} cy={p.y} r="1.5" fill="#FFC800"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 1.5 + (i * 0.1) }}
                      />
                    ))}
                  </svg>
                  
                  {/* Subtle Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gronow-turmeric/10 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* Action Required Queue */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="font-extrabold text-lg text-gray-900 uppercase tracking-tight">Action Queue</h3>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">
                    {pendingStores.length} PENDING
                  </span>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-6 text-center font-mono text-xs text-gray-600">Loading...</div>
                  ) : pendingStores.length === 0 ? (
                    <div className="p-6 text-center font-mono text-xs text-gray-600">No pending actions.</div>
                  ) : (
                    <AnimatePresence>
                      {pendingStores.map(store => (
                        <motion.div 
                          key={store.store_id} 
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                          className="p-4 border-b border-[#333330] last:border-b-0 hover:bg-[#1A1A18] transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-mono text-[10px] text-yellow-600 border border-gronow-turmeric px-1">NEW NODE</div>
                            <div className="font-mono text-[10px] text-gray-600">ID: {store.store_id}</div>
                          </div>
                          <p className="font-display font-bold text-gray-900 mb-1">{store.shop_name}</p>
                          <p className="font-mono text-xs text-gray-600 mb-4">{store.city} • GST: {store.gst_number}</p>
                          <div className="flex gap-2">
                            <button onClick={() => verifyStore(store.store_id)} className="flex-1 bg-white text-black font-display text-sm font-bold py-1 hover:bg-gronow-turmeric transition-colors">VERIFY</button>
                            <button className="flex-1 border border-[#333330] text-gray-600 font-display text-sm py-1 hover:text-gray-900 transition-colors">REJECT</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "FLEET TRACKING" ? (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl text-gray-900 uppercase tracking-tighter">Live Delivery Fleet</h3>
            <div className="bg-white border border-[#333330] p-6 shadow-[4px_4px_0px_0px_#1A1A18]">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="border-b border-[#333330] text-gray-600">
                      <th className="pb-4 font-normal">DRIVER ID</th>
                      <th className="pb-4 font-normal">NAME & CONTACT</th>
                      <th className="pb-4 font-normal">VEHICLE</th>
                      <th className="pb-4 font-normal">STATUS</th>
                      <th className="pb-4 font-normal">CURRENT ASSIGNMENT</th>
                      <th className="pb-4 font-normal">LATEST GPS PING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.length === 0 ? (
                      <tr><td colSpan={6} className="py-6 text-center text-gray-600">No active drivers in the grid.</td></tr>
                    ) : (
                      fleet.map(d => (
                        <tr key={d.partner_id} className="border-b border-[#333330] hover:bg-[#1A1A18]">
                          <td className="py-4 text-yellow-600">DRV_{d.partner_id}</td>
                          <td className="py-4 text-gray-900">
                            <div>{d.first_name} {d.last_name}</div>
                            <div className="text-gray-600 text-xs">{d.phone}</div>
                          </td>
                          <td className="py-4 text-gray-600">{d.vehicle_type} ({d.vehicle_number})</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-xs border ${
                              d.availability_status === 'AVAILABLE' ? 'border-green-500 text-green-500' :
                              d.availability_status === 'BUSY' ? 'border-orange-500 text-orange-500' :
                              'border-red-500 text-red-500'
                            }`}>{d.availability_status}</span>
                          </td>
                          <td className="py-4 text-gray-900">
                            {d.order_id ? (
                              <div>
                                <span className="text-yellow-600">ORD_{d.order_id}</span>
                                <span className="text-xs text-gray-600 ml-2">[{d.route_status}]</span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="py-4 text-gray-600 text-xs">
                            {d.latitude && d.longitude ? (
                              <div className="flex flex-col gap-1">
                                <span>LAT: {parseFloat(d.latitude).toFixed(4)}</span>
                                <span>LON: {parseFloat(d.longitude).toFixed(4)}</span>
                              </div>
                            ) : (
                              <span className="text-red-500">NO SIGNAL</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "ORDER LEDGER" ? (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl text-gray-900 uppercase tracking-tighter">Global Order Ledger</h3>
            <div className="bg-white border border-[#333330] p-6 shadow-[4px_4px_0px_0px_#1A1A18]">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="border-b border-[#333330] text-gray-600">
                      <th className="pb-4 font-normal">ORDER ID</th>
                      <th className="pb-4 font-normal">TIMESTAMP</th>
                      <th className="pb-4 font-normal">CUSTOMER</th>
                      <th className="pb-4 font-normal">FULFILLMENT NODE</th>
                      <th className="pb-4 font-normal">AMOUNT</th>
                      <th className="pb-4 font-normal">PAYMENT</th>
                      <th className="pb-4 font-normal">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={7} className="py-6 text-center text-gray-600">No transactions recorded.</td></tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.order_id} className="border-b border-[#333330] hover:bg-[#1A1A18]">
                          <td className="py-4 text-gray-900 font-bold">{o.order_number}</td>
                          <td className="py-4 text-gray-600 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                          <td className="py-4 text-gray-600">
                            <div>{o.customer_name}</div>
                            <div className="text-xs">{o.customer_email}</div>
                          </td>
                          <td className="py-4 text-yellow-600">{o.store_name}</td>
                          <td className="py-4 text-gray-900">₹{o.total_amount}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-[10px] uppercase border ${
                              o.payment_status === 'SUCCESS' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-600'
                            }`}>{o.payment_status || 'PENDING'}</span>
                            <div className="text-xs text-gray-600 mt-1">{o.payment_method}</div>
                          </td>
                          <td className="py-4">
                            <span className="text-gray-900 text-xs">{o.order_status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "NODE MANAGEMENT" ? (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl text-gray-900 uppercase tracking-tighter">Network Node Management</h3>
            <div className="bg-white border border-[#333330] p-6 shadow-[4px_4px_0px_0px_#1A1A18]">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="border-b border-[#333330] text-gray-600">
                      <th className="pb-4 font-normal">NODE ID</th>
                      <th className="pb-4 font-normal">TYPE</th>
                      <th className="pb-4 font-normal">NAME</th>
                      <th className="pb-4 font-normal">LOCATION / VEHICLE</th>
                      <th className="pb-4 font-normal">STATUS</th>
                      <th className="pb-4 font-normal">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.length === 0 ? (
                      <tr><td colSpan={6} className="py-6 text-center text-gray-600">No nodes found in the network.</td></tr>
                    ) : (
                      nodes.map(n => (
                        <tr key={`${n.type}_${n.id}`} className={`border-b border-[#333330] hover:bg-[#1A1A18] ${!n.is_active ? 'opacity-50' : ''}`}>
                          <td className="py-4 text-gray-900 font-bold">{n.type === 'STORE' ? 'STR_' : 'DRV_'}{n.id}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-[10px] uppercase border ${
                              n.type === 'STORE' ? 'border-blue-500 text-blue-500' : 'border-gronow-turmeric text-yellow-600'
                            }`}>{n.type}</span>
                          </td>
                          <td className="py-4 text-gray-300">{n.name}</td>
                          <td className="py-4 text-gray-600">{n.location}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-xs border ${
                              n.is_active ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                            }`}>{n.is_active ? 'ACTIVE' : 'SUSPENDED'}</span>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => toggleNodeStatus(n.user_id)}
                              className={`px-4 py-1 font-display text-sm font-bold transition-colors ${
                                n.is_active ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-gray-900' : 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-gray-900'
                              }`}
                            >
                              {n.is_active ? 'SUSPEND' : 'ACTIVATE'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "PRICING ENGINE" ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="font-display font-bold text-2xl text-gray-900 uppercase tracking-tighter text-center">Global Pricing Engine</h3>
            <div className="bg-[#111110] border border-[#333330] p-8 shadow-[8px_8px_0px_0px_#1A1A18] space-y-8">
              
              <div className="space-y-2">
                <label className="font-mono text-xs text-gray-600 uppercase tracking-widest block">Base Delivery Fee (₹)</label>
                <input 
                  type="number" 
                  value={config.base_delivery_fee} 
                  onChange={e => setConfig({...config, base_delivery_fee: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-[#333330] p-4 text-gray-900 font-display text-xl focus:border-gronow-turmeric outline-none transition-colors" 
                />
                <p className="font-mono text-[10px] text-gray-600">The fixed cost applied to all orders for 15-min delivery.</p>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs text-gray-600 uppercase tracking-widest block">Surge Multiplier (x)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={config.surge_multiplier} 
                  onChange={e => setConfig({...config, surge_multiplier: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-[#333330] p-4 text-gray-900 font-display text-xl focus:border-gronow-turmeric outline-none transition-colors" 
                />
                <p className="font-mono text-[10px] text-gray-600">Dynamic multiplier applied during high demand (e.g. 1.5x).</p>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs text-gray-600 uppercase tracking-widest block">Platform Commission (%)</label>
                <input 
                  type="number" 
                  value={config.platform_commission_percent} 
                  onChange={e => setConfig({...config, platform_commission_percent: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-[#333330] p-4 text-gray-900 font-display text-xl focus:border-gronow-turmeric outline-none transition-colors" 
                />
                <p className="font-mono text-[10px] text-gray-600">Percentage fee deducted from store payouts per transaction.</p>
              </div>

              <button 
                onClick={updateConfig}
                className="w-full bg-gronow-turmeric text-black font-display font-bold py-4 text-xl hover:bg-white transition-colors uppercase tracking-widest shadow-[0_0_20px_rgba(255,200,0,0.2)]"
              >
                Deploy Configuration
              </button>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 border border-[#333330] bg-white p-8">
            <span className="text-4xl mb-4 opacity-50">🚧</span>
            <h3 className="font-display font-bold text-2xl text-gray-900 uppercase tracking-tighter mb-2">{activeTab}</h3>
            <p className="font-mono text-xs text-gray-600 text-center max-w-md">
              This module is currently offline. Wait for the upcoming software grid patch to access this interface.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
