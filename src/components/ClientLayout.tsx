"use client";

import { Navigation } from "./Navigation";
import { useExpenseContext } from "@/context/ExpenseContext";
import { useState } from "react";
import { AIFinancialAssistant } from "./AIFinancialAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Briefcase, Phone, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

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
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.3
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
    };

    return (
      <main className="min-h-screen relative p-6 sm:p-12 flex flex-col items-center justify-center overflow-hidden bg-[#020617] text-white">
        {/* Deep Theatre Background Blobs */}
        <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse-subtle pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 animate-pulse-subtle pointer-events-none" />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="glass-premium rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl relative z-10 max-w-xl w-full border border-white/5"
        >
          <motion.div variants={itemVariants} className="relative inline-block mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 relative z-10">
               <Sparkles className="w-10 h-10 text-primary-400" />
            </div>
            <div className="absolute -inset-4 bg-primary-500/20 blur-2xl rounded-full animate-pulse-rich -z-10" />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Get Started
          </motion.h1>
          <motion.p variants={itemVariants} className="text-foreground/40 mb-10 leading-relaxed font-black uppercase tracking-[0.2em] text-xs">
            Enter your details to start tracking with AI.
          </motion.p>
          
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary-400 transition-colors" />
                <input 
                  required
                  type="text" 
                  placeholder="Sanjay Nalamasa"
                  className="input-premium pl-14"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary-400 transition-colors" />
                <input 
                  required
                  type="email" 
                  placeholder="sanjaynalamasa07@gmail.com"
                  className="input-premium pl-14"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-1">Profession</label>
                <div className="relative group">
                  <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Developer"
                    className="input-premium pl-14"
                    value={formData.profession}
                    onChange={e => setFormData({...formData, profession: e.target.value})}
                  />
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary-400 transition-colors" />
                  <input 
                    type="tel" 
                    placeholder="+1 234 567 890"
                    className="input-premium pl-14"
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                  />
                </div>
              </motion.div>
            </div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className="btn-premium w-full mt-4 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group overflow-hidden relative"
            >
              <span className="relative z-10">{isSubmitting ? "Syncing..." : "Start Tracking"}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-500/20 translate-y-1 group-hover:translate-y-0 transition-transform" />
            </motion.button>
            
            <motion.div variants={itemVariants} className="pt-6 flex items-center justify-center gap-2 text-foreground/20">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
            </motion.div>
          </form>
        </motion.div>
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

        {/* Global Financial Assistant */}
        <AIFinancialAssistant />
      </main>
    </div>
  );
}

