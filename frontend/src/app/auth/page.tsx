"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

type Role = "CUSTOMER" | "STORE_OWNER" | "DELIVERY" | "ADMIN";

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: "CUSTOMER", label: "Customer", icon: "🛒" },
  { id: "STORE_OWNER", label: "Store Partner", icon: "🏪" },
  { id: "DELIVERY", label: "Delivery Driver", icon: "🛵" },
  { id: "ADMIN", label: "Admin", icon: "🛡️" },
];

export default function AuthPortal() {
  const router = useRouter();
  
  // State
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [step, setStep] = useState<"ROLE" | "CREDENTIALS">("ROLE");
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Loading & Session State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient<{ token: string; user: any }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone, password, role: selectedRole })
      });
      
      localStorage.setItem("gronow_token", res.token);
      routeToPortal(res.user.role);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem("gronow_token", res.token);
      routeToPortal(res.user.role);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const routeToPortal = (actualRole: Role) => {
    if (actualRole === "STORE_OWNER") router.push("/store");
    else if (actualRole === "DELIVERY") router.push("/driver");
    else router.push(`/${actualRole?.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="mb-8 cursor-pointer" onClick={() => router.push("/")}>
        <h1 className="font-bold text-5xl tracking-tight text-yellow-500">
          Gronow
        </h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-gray-900">
        
        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {step === "ROLE" && (
            <motion.div 
              key="role"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="font-bold text-3xl text-gray-900 mb-2">Welcome</h2>
                <p className="text-gray-500 font-medium">Select how you want to continue</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                      selectedRole === r.id 
                        ? "border-green-600 bg-green-50 text-green-700 shadow-md shadow-green-100" 
                        : "border-gray-100 bg-white hover:border-green-200 hover:bg-green-50/50"
                    }`}
                  >
                    <span className="text-4xl mb-3">{r.icon}</span>
                    <span className="font-bold text-sm text-center">{r.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("CREDENTIALS")}
                disabled={!selectedRole}
                className="w-full py-4 mt-4 font-bold text-lg bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2: Credentials */}
          {step === "CREDENTIALS" && (
            <motion.div 
              key="credentials"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setStep("ROLE")}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-xl"
                >
                  ←
                </button>
                <div>
                  <h2 className="font-bold text-2xl text-gray-900">
                    {mode === "LOGIN" ? "Sign In" : "Create Account"}
                  </h2>
                  <p className="text-gray-500 font-medium text-sm">
                    As {ROLES.find(r => r.id === selectedRole)?.label}
                  </p>
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

              <form onSubmit={mode === "LOGIN" ? handleLogin : handleRegister} className="space-y-4">
                {mode === "REGISTER" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">FIRST NAME</label>
                      <input 
                        required 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none font-medium transition-all" 
                        value={firstName} onChange={e => setFirstName(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">LAST NAME</label>
                      <input 
                        required 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none font-medium transition-all" 
                        value={lastName} onChange={e => setLastName(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">EMAIL ADDRESS</label>
                  <input 
                    required type="email" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none font-medium transition-all" 
                    value={email} onChange={e => setEmail(e.target.value)} 
                  />
                </div>

                {mode === "REGISTER" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">PHONE NUMBER</label>
                    <input 
                      required 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none font-medium transition-all" 
                      value={phone} onChange={e => setPhone(e.target.value)} 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">PASSWORD</label>
                  <input 
                    required type="password" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none font-medium transition-all" 
                    value={password} onChange={e => setPassword(e.target.value)} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 mt-6 font-bold text-lg bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70 shadow-lg shadow-green-600/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : mode === "LOGIN" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <div className="pt-6 border-t border-gray-100 text-center">
                <button 
                  onClick={() => setMode(mode === "LOGIN" ? "REGISTER" : "LOGIN")}
                  className="text-gray-500 font-medium hover:text-green-600 transition-colors text-sm"
                >
                  {mode === "LOGIN" ? "New to Gronow? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
