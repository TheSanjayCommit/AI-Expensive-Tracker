"use client";

import { useState, useEffect } from "react";
import { Target, TrendingDown, Clock, ChevronRight, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useExpenseContext } from "@/context/ExpenseContext";

export function Goals() {
  const { currencySymbol, expenses } = useExpenseContext();
  const [goal, setGoal] = useState({ name: "Holiday Fund", target: 5000, current: 1250 });

  // Mock progress calculation
  const progress = (goal.current / goal.target) * 100;
  const daysRemaining = 45; // Placeholder for trend-based estimation

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-premium rounded-3xl p-8 shadow-xl relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Target className="w-24 h-24 text-primary-500 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
            <Gift className="w-5 h-5 transition-transform group-hover:rotate-12" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Active Savings Goal</h3>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-foreground/40" />
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <h4 className="text-2xl font-black text-foreground mb-1 tracking-tight">{goal.name}</h4>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Target: {currencySymbol}{goal.target.toLocaleString()}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-emerald-400 tracking-tighter">
              {progress.toFixed(0)}%
            </span>
            <div className="text-right">
              <span className="text-xs font-bold text-foreground/40 block uppercase tracking-widest">Achieved</span>
              <span className="text-lg font-bold text-foreground/90">{currencySymbol}{goal.current.toLocaleString()}</span>
            </div>
          </div>

          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 2, ease: "circOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 relative"
            >
              <div className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-[2px] animate-pulse" />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/40 uppercase tracking-widest">
              <TrendingDown className="w-3 h-3 text-emerald-500" /> Daily Save
            </div>
            <p className="text-lg font-black text-foreground/90">{currencySymbol}25</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-foreground/40 uppercase tracking-widest">
              <Clock className="w-3 h-3 text-blue-500" /> Est. Time
            </div>
            <p className="text-lg font-black text-foreground/90">{daysRemaining} Days</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
