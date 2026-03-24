"use client";

import { Dashboard } from "@/components/Dashboard";
import { Insights } from "@/components/Insights";
import { useExpenseContext } from "@/context/ExpenseContext";

export default function HomeDashboard() {
  const { expenses, deleteExpense, user } = useExpenseContext();

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-foreground/50 text-sm">Welcome back, {user?.displayName?.split(" ")[0] || "User"}. Here's your financial summary.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Dashboard expenses={expenses} onDelete={deleteExpense} />
        </div>
        <div className="space-y-6">
           <Insights expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
