"use client";

import { useExpenseContext } from "@/context/ExpenseContext";
import { Trash2, Download, Search } from "lucide-react";
import { useState } from "react";

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

export default function TransactionsPage() {
  const { expenses, deleteExpense, currencySymbol } = useExpenseContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExpenses = expenses.filter(exp => 
    exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-foreground/50 text-sm">View, search, and export your entire financial history.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      <div className="glass dark:glass-dark rounded-3xl p-6 shadow-lg space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search vendor or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
          />
        </div>

        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-foreground/50">
              No transactions found.
            </div>
          ) : (
            filteredExpenses.map((exp, i) => (
              <div key={exp.id || i} className="group flex justify-between items-center p-4 hover:bg-white/5 dark:hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/5 cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex flex-shrink-0 items-center justify-center text-xl shadow-inner border border-white/5">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground tracking-tight">{exp.vendor}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">{new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric"})} • {exp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-lg text-foreground tracking-tight">{currencySymbol}{exp.amount.toFixed(2)}</p>
                  {exp.id && (
                    <button 
                      onClick={() => deleteExpense(exp.id!)}
                      className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all md:opacity-0 group-hover:opacity-100 hover:scale-110"
                      title="Delete expense"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
