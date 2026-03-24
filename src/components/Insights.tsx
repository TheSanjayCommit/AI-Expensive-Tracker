"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { Expense } from "@/lib/firebase";

interface InsightsProps {
  expenses: Expense[];
}

export function Insights({ expenses }: InsightsProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expenses.length === 0) return;

    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/generate-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send last 50 expenses to not overload context
          body: JSON.stringify({ expenses: expenses.slice(0, 50) }),
        });
        const data = await res.json();
        if (data.tips) {
          setTips(data.tips);
        }
      } catch (e) {
        console.error("Failed to load insights", e);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to avoid querying Gemini too often when typing/adding
    const timeoutId = setTimeout(() => {
      fetchInsights();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [expenses]);

  if (expenses.length === 0) return null;

  return (
    <div className="glass dark:glass-dark rounded-3xl p-6 shadow-lg border-l-4 border-l-primary-500 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-yellow-400/20 text-yellow-500 rounded-full">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium">AI Insights</h3>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary-500 ml-auto" />}
      </div>
      
      {tips.length > 0 ? (
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="text-sm text-foreground/80 flex space-x-2">
              <span className="text-primary-500 font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      ) : !isLoading && (
        <p className="text-sm text-foreground/60">No insights available right now.</p>
      )}
    </div>
  );
}
