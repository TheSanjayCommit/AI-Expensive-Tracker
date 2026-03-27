"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Lightbulb, Loader2, RefreshCw, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Expense } from "@/lib/firebase";
import { useExpenseContext } from "@/context/ExpenseContext";

interface InsightsProps {
  expenses: Expense[];
}

export function Insights({ expenses }: InsightsProps) {
  const { currency } = useExpenseContext();
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = useCallback(async () => {
    if (expenses.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          expenses: expenses.slice(0, 50),
          currency: currency 
        }),
      });
      const data = await res.json();
      if (data.tips) {
        setTips(data.tips);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to load insights", e);
    } finally {
      setIsLoading(false);
    }
  }, [expenses, currency]);

  useEffect(() => {
    if (expenses.length === 0) return;
    
    // Auto-fetch on first load or if tips are empty
    if (tips.length === 0 && !isLoading) {
      fetchInsights();
    }
  }, [expenses, fetchInsights, tips.length, isLoading]);

  if (expenses.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-premium rounded-3xl p-8 shadow-xl relative overflow-hidden h-full flex flex-col"
    >
      {/* Background Sparkle */}
      <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-32 h-32 text-primary-500 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400/20 text-yellow-500 rounded-2xl shadow-inner border border-yellow-500/10 animate-pulse">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">AI Advisor</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mt-0.5">Personalized Insights</p>
          </div>
        </div>
        <button 
          onClick={() => fetchInsights()}
          disabled={isLoading}
          className={`p-2.5 rounded-2xl transition-all ${isLoading ? 'bg-white/5 text-white/20' : 'bg-white/5 text-foreground/40 hover:text-primary-500 hover:bg-primary-500/10 active:scale-90 shadow-inner'}`}
          title="Refresh Insights"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-primary-500/60' : ''}`} />
        </button>
      </div>

      <div className="flex-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          {tips.length > 0 && !isLoading ? (
            <motion.div 
              key="tips-list"
              className="space-y-4"
            >
              {tips.map((tip, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group shadow-sm"
                >
                  <div className="flex gap-4">
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {tip}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : isLoading ? (
            <motion.div 
              key="loading-insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center gap-4 h-full"
            >
              <div className="relative">
                 <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                 <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-xs text-foreground/50 font-black uppercase tracking-widest">Gathering Data</p>
                <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-[0.2em] mt-1 animate-pulse">Running advanced analysis...</p>
              </div>
            </motion.div>
          ) : (
             <motion.div 
              key="empty-insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center p-8 text-center"
             >
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/5">
                   <Clock className="w-8 h-8 text-foreground/20" />
                </div>
                <p className="text-sm text-foreground/40 font-bold leading-relaxed italic"> 
                  Collecting more data to provide precise insights. Continue tracking!
                </p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {lastUpdated && tips.length > 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-6 mt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-foreground/20 font-black uppercase tracking-[0.2em]"
        >
          <Clock className="w-3.5 h-3.5" />
          Last Advice: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </motion.div>
      )}
    </motion.div>
  );
}

