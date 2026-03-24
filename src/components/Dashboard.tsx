"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Trash2, Download } from "lucide-react";
import { Expense } from "@/lib/firebase";

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

const BUDGET = 1000;

export function Dashboard({ expenses, onDelete }: DashboardProps) {
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

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
      .slice(-7); // Last 7 days with activity
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
      <div className="glass dark:glass-dark rounded-3xl p-8 text-center text-foreground/70">
        <p>No expenses found yet. Try speaking your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Total Spent Card & Budget */}
      <div className="glass dark:glass-dark rounded-3xl p-8 shadow-lg flex flex-col justify-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl flex-shrink-0" />
        <h2 className="text-xl text-foreground/80 font-medium text-center">Total Spent</h2>
        <p className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-blue-500 bg-clip-text text-transparent mt-2 text-center">
          ${totalSpent.toFixed(2)}
        </p>
        
        <div className="mt-8 space-y-3 z-10 w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-foreground/70">Monthly Budget</span>
            <span className={totalSpent > BUDGET ? "text-red-500" : "text-foreground"}>
              ${totalSpent.toFixed(0)} / ${BUDGET}
            </span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${totalSpent > BUDGET ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-primary-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]'}`}
              style={{ width: `${Math.min((totalSpent / BUDGET) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="glass dark:glass-dark rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
             {categoryData.map((cat, i) => (
               <div key={cat.name} className="flex items-center text-xs space-x-1">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span>{cat.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Daily Bar Chart */}
        <div className="glass dark:glass-dark rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-medium mb-4">Recent Daily Spending</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="glass dark:glass-dark rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
          <span>Recent Transactions</span>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full">{expenses.length} Records</span>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs bg-blue-500/80 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full transition-colors font-medium shadow-lg shadow-blue-500/20"
              title="Download CSV"
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </h3>
        <div className="space-y-3">
          {expenses.slice(0, 10).map((exp, i) => (
            <div key={exp.id || i} className="group flex justify-between items-center p-3.5 hover:bg-white/5 dark:hover:bg-white/10 rounded-2xl transition-all hover:scale-[1.01] border border-transparent hover:border-white/5 cursor-default">
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
                <p className="font-bold text-lg text-foreground tracking-tight">${exp.amount.toFixed(2)}</p>
                {onDelete && exp.id && (
                  <button 
                    onClick={() => onDelete(exp.id!)}
                    className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    title="Delete expense"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
