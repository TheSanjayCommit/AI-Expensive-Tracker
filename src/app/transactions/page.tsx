"use client";

import { useExpenseContext } from "@/context/ExpenseContext";
import { Trash2, Download, Search, Filter, Calendar, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

type Period = "Total" | "Day" | "Week" | "Month" | "Year";

export default function TransactionsPage() {
  const { expenses, deleteExpense, currencySymbol } = useExpenseContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterPeriod, setFilterPeriod] = useState<Period>("Total");

  const categories = ["All", ...Object.keys(CATEGORY_ICONS)];
  const periods: Period[] = ["Total", "Day", "Week", "Month", "Year"];

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const expDateStr = exp.date;

      // Search & Category
      const matchesSearch = exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || exp.category === selectedCategory;
      
      // Period
      let matchesPeriod = true;
      if (filterPeriod === "Day") matchesPeriod = expDateStr === todayStr;
      else if (filterPeriod === "Week") matchesPeriod = expDate >= startOfWeek;
      else if (filterPeriod === "Month") matchesPeriod = expDate >= startOfMonth;
      else if (filterPeriod === "Year") matchesPeriod = expDate >= startOfYear;

      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [expenses, searchTerm, selectedCategory, filterPeriod]);

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

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">History Log</h1>
          <p className="text-foreground/40 text-sm font-black uppercase tracking-widest mt-1">
            Analyzing <span className="text-primary-400">{filteredExpenses.length}</span> matching entries
          </p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportCSV}
          className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-white/5"
        >
          <Download className="w-4 h-4" /> Export records
        </motion.button>
      </header>

      <div className="space-y-8">
        {/* Period Selector Tabs */}
        <div className="flex justify-center md:justify-start">
            <div className="inline-flex p-1.5 bg-white/5 border border-white/5 rounded-[2rem] gap-1 relative overflow-hidden backdrop-blur-xl">
                {periods.map((p) => (
                    <button
                        key={p}
                        onClick={() => setFilterPeriod(p)}
                        className={`relative z-10 px-6 py-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterPeriod === p ? "text-white" : "text-foreground/30 hover:text-foreground/60"
                        }`}
                    >
                        {filterPeriod === p && (
                            <motion.div 
                                layoutId="period-bg"
                                className="absolute inset-0 bg-primary-500 rounded-[1.5rem] -z-10 shadow-lg shadow-primary-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {p}
                    </button>
                ))}
            </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by vendor, amount or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-foreground placeholder:text-foreground/10 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 transition-all font-bold text-xl shadow-inner shadow-black"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  selectedCategory === cat 
                    ? "bg-primary-500/20 border-primary-500/50 text-white shadow-xl shadow-primary-500/10" 
                    : "bg-white/5 border-white/5 text-foreground/30 hover:text-foreground/70 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 relative">
          <AnimatePresence mode="popLayout">
            {filteredExpenses.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-32 glass-premium rounded-[3rem] border border-white/5 flex flex-col items-center justify-center gap-4"
              >
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                   <Clock className="w-10 h-10 text-foreground/10" />
                </div>
                <div className="space-y-1">
                   <h3 className="text-lg font-black tracking-tight text-foreground/40">No records found</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Try expanding your time filters or criteria</p>
                </div>
              </motion.div>
            ) : (
              filteredExpenses.map((exp, i) => (
                <motion.div 
                  layout
                  key={exp.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div className="glass-premium rounded-[2.5rem] p-6 transition-all border border-white/5 hover:border-white/10 hover:shadow-2xl hover:bg-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
                    {/* Subtle glow */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                      <div className="w-20 h-20 rounded-3xl bg-slate-950/80 flex flex-shrink-0 items-center justify-center text-4xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                        {getCategoryIcon(exp.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-black text-2xl text-white tracking-tighter">{exp.vendor}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                            {exp.category}
                           </span>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric"})}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto relative z-10 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <p className="font-black text-4xl text-foreground tracking-tighter">
                        {currencySymbol}{exp.amount.toFixed(2)}
                      </p>
                      <AnimatePresence>
                        {exp.id && (
                          <motion.button 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteExpense(exp.id!)}
                            className="p-4 text-red-500/20 hover:text-red-500 hover:bg-red-500/5 rounded-[1.5rem] transition-all shadow-inner border border-transparent hover:border-red-500/10"
                          >
                            <Trash2 className="w-6 h-6" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


