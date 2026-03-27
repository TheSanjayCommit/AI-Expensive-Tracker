"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Trash2, Download, TrendingUp, AlertCircle, Zap } from "lucide-react";
import { Expense } from "@/lib/firebase";

import { useExpenseContext } from "@/context/ExpenseContext";

interface DashboardProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const CATEGORY_ICONS: Record<string, string> = {
  "Food": "🍔",
  "Transport": "🚕",
  "Shopping": "🛍️",
  "Entertainment": "🎬",
  "Groceries": "🛒",
  "Utilities": "💡",
  "Health": "💊",
  "Other": "📦"
};
const getCategoryIcon = (category: string) => CATEGORY_ICONS[category] || "💸";

export function Dashboard({ expenses, onDelete }: DashboardProps) {
  const { currencySymbol } = useExpenseContext();
  const [budget, setBudget] = useState(1000);

  useEffect(() => {
    const saved = localStorage.getItem("expense_budget");
    if (saved) setBudget(Number(saved));
  }, []);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const budgetUsage = (totalSpent / budget) * 100;
  const isOverBudget = totalSpent > budget;
  const isBudgetWarning = budgetUsage > 80;

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach((exp) => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dailyData = useMemo(() => {
    const dates: Record<string, number> = {};
    expenses.forEach((exp) => {
      dates[exp.date] = (dates[exp.date] || 0) + exp.amount;
    });
    return Object.entries(dates)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); 
  }, [expenses]);

  const handleExportCSV = () => {
    const headers = ["Date", "Vendor", "Category", "Amount"];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      `"${exp.vendor}"`,
      `"${exp.category}"`,
      exp.amount.toFixed(2)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (expenses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-3xl p-12 text-center"
      >
        <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-10 h-10 text-primary-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-foreground">Ready to start tracking?</h2>
        <p className="text-foreground/50">Your expenses and insights will appear here once you add your first record.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-8">
      
      {/* Financial Health Card */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`glass-premium rounded-3xl p-10 overflow-hidden relative group transition-all duration-500 ${
          isOverBudget ? 'glow-red' : 'glow-primary'
        }`}
      >
        {/* Dynamic Pulse Ring */}
        <div className={`absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none transition-colors duration-500`}>
           <div className={`w-96 h-96 rounded-full blur-[100px] animate-pulse-rich ${
             isOverBudget ? 'bg-red-500' : isBudgetWarning ? 'bg-orange-500' : 'bg-primary-500'
           }`} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isOverBudget ? 'bg-red-500/20 text-red-500' : 'bg-primary-500/20 text-primary-500'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" /> Financial Health: {isOverBudget ? 'Critical' : isBudgetWarning ? 'Warning' : 'Excellent'}
            </div>
            <h2 className="text-sm font-semibold text-foreground/40 uppercase tracking-[0.2em]">Current Spending</h2>
            <div className="flex items-baseline gap-1 justify-center md:justify-start">
              <span className="text-4xl font-bold text-foreground/60">{currencySymbol}</span>
              <span className="text-7xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-white/30 bg-clip-text text-transparent">
                {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-6">
             <div className="flex justify-between items-end mb-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Safe to Spend</p>
                  <p className={`text-2xl font-black ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    {currencySymbol}{Math.max(0, budget - totalSpent).toLocaleString()}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Monthly Budget</p>
                  <p className="text-2xl font-black text-foreground/90">{currencySymbol}{budget.toLocaleString()}</p>
                </div>
             </div>

             <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budgetUsage, 100)}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={`h-full rounded-full relative ${
                    isOverBudget ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-primary-500 to-blue-400'
                  }`}
                >
                  <div className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-[2px] animate-[pulse_1s_infinite]" />
                </motion.div>
             </div>
             
             {isOverBudget && (
               <p className="text-xs text-red-400/80 font-bold animate-pulse text-center uppercase tracking-widest">
                 🚨 Budget Exceeded by {currencySymbol}{(totalSpent - budget).toFixed(0)}
               </p>
             )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Visualization */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-premium rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold tracking-tight">Spending Breakdown</h3>
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-500" />
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {categoryData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${currencySymbol}${Number(value).toFixed(0)}`}
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
             {categoryData.slice(0, 4).map((cat: any, i: number) => (
               <div key={cat.name} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-xs font-medium text-foreground/70">{cat.name}</span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Daily Insights Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-premium rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-lg font-bold tracking-tight mb-8">Activity Trends</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  formatter={(value: any) => `${currencySymbol}${Number(value).toFixed(0)}`}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Transaction History Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-premium rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-2xl transition-all border border-white/5"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {expenses.slice(0, 5).map((exp, i) => (
              <motion.div 
                key={exp.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex justify-between items-center p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 flex flex-shrink-0 items-center justify-center text-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg tracking-tight">{exp.vendor}</p>
                    <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest mt-1">
                      {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {exp.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-black text-xl text-foreground tracking-tighter">
                    {currencySymbol}{exp.amount.toLocaleString()}
                  </p>
                  {onDelete && exp.id && (
                    <button 
                      onClick={() => onDelete(exp.id!)}
                      className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:rotate-6 active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}

