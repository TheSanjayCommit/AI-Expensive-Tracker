"use client";

import { useEffect, useState, useCallback } from "react";
import { Lightbulb, Loader2, RefreshCw, Clock } from "lucide-react";
import { Expense } from "@/lib/firebase";

interface InsightsProps {
  expenses: Expense[];
}

export function Insights({ expenses }: InsightsProps) {
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
        body: JSON.stringify({ expenses: expenses.slice(0, 50) }),
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
  }, [expenses]);

  useEffect(() => {
    if (expenses.length === 0) return;
    
    // Auto-fetch on first load or if tips are empty
    if (tips.length === 0 && !isLoading) {
      fetchInsights();
    }
  }, [expenses, fetchInsights, tips.length, isLoading]);

  if (expenses.length === 0) return null;

  return (
    <div className="glass dark:glass-dark rounded-3xl p-6 shadow-lg border-l-4 border-l-primary-500 animate-in fade-in slide-in-from-right-4 duration-700 h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-400/20 text-yellow-500 rounded-xl shadow-inner border border-yellow-500/10">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">AI Insights</h3>
        </div>
        <button 
          onClick={() => fetchInsights()}
          disabled={isLoading}
          className={`p-2 rounded-xl transition-all ${isLoading ? 'bg-white/5 text-white/20' : 'bg-white/5 text-foreground/40 hover:text-primary-500 hover:bg-primary-500/10 active:scale-95'}`}
          title="Refresh Insights"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {tips.length > 0 ? (
        <div className="space-y-4">
          <ul className="space-y-4">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground/80 flex space-x-3 group">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
          {lastUpdated && (
            <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-foreground/30 font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500/40" />
          <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest animate-pulse">Analyzing patterns...</p>
        </div>
      ) : (
        <p className="text-sm text-foreground/60 p-4 text-center italic leading-relaxed"> No insights available right now. Recording more expenses will help AI identify spending patterns.</p>
      )}
    </div>
  );
}
