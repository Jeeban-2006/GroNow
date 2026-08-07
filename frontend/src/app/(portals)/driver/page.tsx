"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

export default function DriverPortal() {
  const [isOnline, setIsOnline] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [stats, setStats] = useState<any>({ today: { trips: 0, earnings: 0 }, week: { trips: 0, earnings: 0 }, total: { trips: 0, earnings: 0 }, rating: 4.8 });
  const [statsTab, setStatsTab] = useState<'today' | 'week' | 'total'>('today');
  const [riderLocation, setRiderLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState<string>('');
  const [profileData, setProfileData] = useState<any>({});
  const trackerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initial fetch
    apiClient("/api/profile", { requireAuth: true })
      .then((res: any) => {
        if (res.user) {
          setUser(res.user);
          setProfileData(res.user);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isOnline) {
      fetchAssignments();
      const interval = setInterval(fetchAssignments, 5000); // poll every 5s for snappy feel
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Handle tab close/refresh to mark driver offline
  useEffect(() => {
    const handleUnload = () => {
      if (isOnline) {
        const token = localStorage.getItem("gronow_token");
        if (token) {
          // Use fetch with keepalive to ensure the request completes as the tab closes
          fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/availability` : "/api/delivery/availability", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ availability_status: "OFFLINE" }),
            keepalive: true
          }).catch(console.error);
        }
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isOnline]);

  useEffect(() => {
    apiClient<any>("/api/delivery/stats", { requireAuth: true })
      .then(res => {
        if (res) setStats(res);
      })
      .catch(console.error);
  }, [activeRoute?.route_status]);

  const fetchAssignments = async () => {
    try {
      const data = await apiClient<any[]>("/api/delivery/assignments", { requireAuth: true }).catch(() => []);
      setAssignments(data);
      const active = data.find(a => !['DELIVERED', 'CANCELLED'].includes(a.route_status));
      setActiveRoute(active || null);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (status: string) => {
    if (!activeRoute) return;
    try {
      await apiClient("/api/delivery/status", {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({ order_id: activeRoute.order_id, status, otp: status === 'DELIVERED' ? deliveryOtp : undefined })
      });
      fetchAssignments();
      if (status === 'DELIVERED') setDeliveryOtp('');
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const updateProfile = async () => {
    try {
      await apiClient("/api/profile", {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(profileData)
      });
      setUser({ ...user, ...profileData });
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    }
  };

  // Blinkit Live Telemetry Emitter (Real GPS!)
  useEffect(() => {
    let watchId: number | undefined;

    if (activeRoute && ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(activeRoute.route_status)) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition((position) => {
          const { latitude, longitude, speed } = position.coords;
          
          setRiderLocation({ lat: latitude, lng: longitude });

          apiClient("/api/delivery/tracking", {
            method: "POST",
            requireAuth: true,
            body: JSON.stringify({
              order_id: activeRoute.order_id,
              latitude,
              longitude,
              tracking_status: activeRoute.route_status
            })
          }).catch(console.error);
        }, (error) => {
          console.error("GPS Error:", error);
        }, { 
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        });
      } else {
        alert("Geolocation is not supported by your browser");
      }
    } else {
      setRiderLocation(null);
    }

    return () => {
      if (watchId !== undefined && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeRoute?.route_status, activeRoute?.order_id]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-800">Partner Hub</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">ID: DRV_8921</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
            <button 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
            >
                {user?.first_name?.charAt(0) || 'D'}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem("gronow_token");
                router.push("/");
              }}
              className="text-xs text-red-500 font-semibold px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-lg mx-auto w-full">
        
        {!activeRoute ? (
          <>
            {/* Earnings Widget */}
            <div className="bg-white shadow-sm rounded-2xl p-5 mb-5 border border-gray-100">
              {/* Stat Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                {(['today', 'week', 'total'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatsTab(tab)}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-lg capitalize transition-all ${
                      statsTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'All Time'}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-1">EARNINGS</p>
                  <p className="font-bold text-3xl text-gray-800">₹{((stats[statsTab] as any)?.earnings || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-1">TRIPS</p>
                  <p className="font-bold text-2xl text-green-600">{(stats[statsTab] as any)?.trips || 0}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="font-bold text-gray-800">{(stats as any).rating?.toFixed(1) || '4.8'}</span>
                  <span className="text-xs text-gray-400">Rating</span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{(stats.total as any)?.trips || 0}</span> total deliveries
                </div>
              </div>
            </div>

            {/* Radar / Status Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <motion.div 
                  animate={isOnline ? { scale: [1, 2], opacity: [0.5, 0] } : { scale: 1, opacity: 0.1 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute w-48 h-48 rounded-full border-2 border-green-400"
                />
                <motion.div 
                  animate={isOnline ? { scale: [1, 2.5], opacity: [0.3, 0] } : { scale: 1.5, opacity: 0.05 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }}
                  className="absolute w-48 h-48 rounded-full border-2 border-green-400"
                />
              </div>

              <div className="z-10 text-center bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-gray-100">
                {isOnline ? (
                  <div className="space-y-3">
                    <div className="font-bold text-lg text-green-600 animate-pulse">
                      Looking for orders...
                    </div>
                    <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
                      You are in a high-demand zone. Keep the app open to receive instant alerts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="font-bold text-lg text-gray-400">
                      You're offline
                    </div>
                    <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
                      Go online to start receiving and delivering orders in your area.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-8">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';
                    
                    let lat = null;
                    let lng = null;

                    if (newStatus === 'AVAILABLE' && "geolocation" in navigator) {
                      // Get location before going online
                      try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                          navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                          });
                        });
                        lat = position.coords.latitude;
                        lng = position.coords.longitude;
                      } catch (e) {
                        console.warn("Could not get exact location, proceeding without it.", e);
                      }
                    }

                    await apiClient("/api/delivery/availability", {
                      method: "PUT",
                      requireAuth: true,
                      body: JSON.stringify({ 
                        availability_status: newStatus,
                        latitude: lat,
                        longitude: lng
                      })
                    });
                    setIsOnline(!isOnline);
                  } catch (err: any) {
                    alert("Failed to change status: " + err.message);
                  }
                }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
                  isOnline 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isOnline ? "Go Offline" : "Go Online"}
              </motion.button>
            </div>
          </>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full bg-white rounded-t-3xl shadow-xl overflow-hidden -mx-4 -mb-4 md:-mx-6 md:-mb-6 relative z-10"
            >
              
              {/* Map Section */}
              {activeRoute.waypoints && (
                <div className="h-64 md:h-80 w-full relative z-0 bg-gray-100">
                  <RouteMap 
                    waypoints={typeof activeRoute.waypoints === 'string' ? JSON.parse(activeRoute.waypoints) : activeRoute.waypoints} 
                    riderLocation={riderLocation || undefined}
                    lightMode={true}
                  />
                </div>
              )}

              {/* Status Banner */}
              <div className="bg-green-600 text-white p-3 text-center font-bold text-sm shadow-md z-10">
                ACTIVE DELIVERY ROUTE
              </div>

              {/* Route Details */}
              <div className="p-6 space-y-5 bg-white z-10 relative flex-1 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Order #</h3>
                    <p className="font-bold text-gray-800 text-lg">{activeRoute.order_number}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Earning</h3>
                    <p className="font-bold text-xl text-green-600">₹35</p>
                  </div>
                </div>
                
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                  {activeRoute.waypoints ? (
                    (() => {
                      const parsedWaypoints = typeof activeRoute.waypoints === 'string' ? JSON.parse(activeRoute.waypoints) : activeRoute.waypoints;
                      const pickups = parsedWaypoints.filter((wp: any) => wp.type === 'pickup');
                      return pickups.map((p: any, i: number) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-6 w-3 h-3 bg-white border-2 border-green-500 rounded-full mt-1.5 z-10"></div>
                          <h3 className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Pickup {i+1}</h3>
                          <p className="font-bold text-gray-800">{p.name}</p>
                        </div>
                      ));
                    })()
                  ) : null}

                  <div className="relative">
                    <div className="absolute -left-6 w-3 h-3 bg-green-500 rounded-full mt-1.5 z-10 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
                    <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Drop-off</h3>
                    <p className="font-bold text-gray-800">{activeRoute.customer_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{activeRoute.customer_address}, {activeRoute.customer_city}</p>
                  </div>
                </div>

                {activeRoute.route_status === 'ON_THE_WAY' && (
                  <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
                    <div className="text-xs text-green-700 font-bold">
                      📡 Transmitting live location...
                    </div>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-white border-t border-gray-100 pb-8">
                {activeRoute.route_status === 'ASSIGNED' && (
                  <button onClick={() => updateStatus('PICKED_UP')} className="w-full py-4 rounded-xl font-bold text-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg">
                    Confirm Pickup
                  </button>
                )}
                {activeRoute.route_status === 'PICKED_UP' && (
                  <button onClick={() => updateStatus('ON_THE_WAY')} className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30">
                    Start Navigation
                  </button>
                )}
                {activeRoute.route_status === 'ON_THE_WAY' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700 text-center">Verify Delivery PIN</p>
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit PIN"
                      value={deliveryOtp}
                      onChange={(e) => setDeliveryOtp(e.target.value)}
                      className="w-full bg-gray-100 border border-gray-200 text-center tracking-[0.5em] font-black text-2xl py-4 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      maxLength={6}
                    />
                    <button 
                      onClick={() => updateStatus('DELIVERED')} 
                      disabled={deliveryOtp.length !== 6}
                      className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
                    >
                      Confirm OTP & Deliver
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-xl text-gray-900">Partner Profile</h3>
                <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
              </div>
              
              <div className="p-6 space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-4">
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
                      <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">VEHICLE TYPE</label>
                            <input 
                            type="text" 
                            placeholder="e.g. Bike"
                            value={profileData.vehicle_type || ""} 
                            onChange={(e) => setProfileData({...profileData, vehicle_type: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">VEHICLE NUMBER</label>
                            <input 
                            type="text" 
                            placeholder="e.g. OD-02-AB-1234"
                            value={profileData.vehicle_number || ""} 
                            onChange={(e) => setProfileData({...profileData, vehicle_number: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">DRIVING LICENSE</label>
                        <input 
                          type="text" 
                          value={profileData.driving_license || ""} 
                          onChange={(e) => setProfileData({...profileData, driving_license: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                        />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <button onClick={() => setEditMode(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">CANCEL</button>
                        <button onClick={updateProfile} className="flex-1 py-3 text-sm font-bold bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors">SAVE PROFILE</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 mb-1">NAME</span>
                        <p className="font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 mb-1">PHONE</span>
                        <p className="font-bold text-gray-900">{user?.phone_number || "Not provided"}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <span className="block text-xs font-semibold text-gray-500 mb-1">VEHICLE INFO</span>
                        <p className="font-bold text-gray-900">{user?.vehicle_type || "None"} - {user?.vehicle_number || "No Plate"}</p>
                        <p className="font-semibold text-sm text-gray-500 mt-1">DL: {user?.driving_license || "Not provided"}</p>
                      </div>
                      <div className="pt-4 flex gap-3">
                        <button onClick={() => setEditMode(true)} className="flex-1 py-3 text-sm font-bold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">EDIT PROFILE</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
