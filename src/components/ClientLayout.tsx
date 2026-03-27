"use client";

import { Navigation } from "./Navigation";
import { useExpenseContext } from "@/context/ExpenseContext";
import { useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, register } = useExpenseContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profession: "",
    number: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/50">Loading AI Expense Tracker...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setIsSubmitting(true);
    try {
      await register(formData);
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen relative p-6 sm:p-12 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] translate-x-1/3" />
        
        <div className="glass dark:glass-dark rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative z-10 max-w-lg w-full border border-white/10 animate-in zoom-in-95 duration-700">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6 border border-white/20">
             <span className="text-3xl">🎙️</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">Get Started</h1>
          <p className="text-foreground/60 mb-8 leading-relaxed font-medium">Enter your details to start tracking with AI.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70 ml-1">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-sans"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70 ml-1">Email Address</label>
              <input 
                required
                type="email" 
                placeholder="john@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-sans"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 ml-1">Profession</label>
                <input 
                  type="text" 
                  placeholder="Developer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-sans"
                  value={formData.profession}
                  onChange={e => setFormData({...formData, profession: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1 234 567 890"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-sans"
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full mt-6 py-4 px-6 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Start Tracking"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-primary-500/30">
      <Navigation user={user} />
      <main className="flex-1 h-screen overflow-y-auto w-full md:pl-64 pb-24 md:pb-0 relative">
        {/* Subtle global background blobs */}
        <div className="fixed top-0 left-64 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />
        
        <div className="p-6 md:p-10 max-w-6xl mx-auto relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
