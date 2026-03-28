"use client";

import { useExpenseContext } from "@/context/ExpenseContext";
import { LogOut, User as UserIcon, Wallet, Globe, ShieldCheck, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout, currency, setCurrency, currencySymbol } = useExpenseContext();
  const [budget, setBudget] = useState("1000");

  useEffect(() => {
    const saved = localStorage.getItem("expense_budget");
    if (saved) setBudget(saved);
  }, []);

  const handleSaveBudget = () => {
    localStorage.setItem("expense_budget", budget);
    alert("Financial goals updated successfully! 🎯");
  };

  if (!user) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-10 pb-32"
    >
      <header className="text-center space-y-4">
        <motion.div variants={item} className="relative inline-block">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-blue-600 p-1 shadow-2xl shadow-primary-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full rounded-[2.2rem] bg-slate-900 flex items-center justify-center overflow-hidden border border-white/10">
              <UserIcon className="w-12 h-12 text-primary-400" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-4 border-slate-950">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </motion.div>
        
        <motion.div variants={item}>
          <h1 className="text-4xl font-black tracking-tight text-white">{user.name}</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-xs mt-2">{user.profession || "Financial Enthusiast"}</p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{user.email}</span>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Budget Setting */}
        <motion.div variants={item} className="glass-premium rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Budgeting</h3>
          </div>
          <p className="text-sm text-foreground/40 font-medium leading-relaxed">Adjust your monthly spending target to calibrate your financial pulse.</p>
          
          <div className="space-y-4 pt-2">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 font-black text-xl">{currencySymbol}</span>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-foreground focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-black text-2xl tracking-tighter shadow-inner"
              />
            </div>
            <button 
              onClick={handleSaveBudget}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-400 hover:text-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group/btn"
            >
              Update Goal <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Currency Setting */}
        <motion.div variants={item} className="glass-premium rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Localization</h3>
          </div>
          <p className="text-sm text-foreground/40 font-medium leading-relaxed">Select your regional currency to synchronize all dashboard metrics.</p>
          
          <div className="pt-2">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-black text-lg tracking-tight appearance-none cursor-pointer"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AUD">AUD (A$) - Australian Dollar</option>
                <option value="CAD">CAD (C$) - Canadian Dollar</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest mt-4 text-center">Active Symbol: {currencySymbol}</p>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="flex justify-center pt-6">
        <button 
          onClick={logout}
          className="flex items-center gap-3 text-red-500/60 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 px-8 py-4 rounded-[2rem] transition-all font-black uppercase tracking-[0.2em] text-[10px] border border-red-500/10 hover:border-red-500/30 shadow-lg shadow-red-500/5"
        >
          <LogOut className="w-4 h-4" /> Final Sign Out
        </button>
      </motion.div>
    </motion.div>
  );
}

