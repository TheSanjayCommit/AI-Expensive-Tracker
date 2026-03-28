"use client";

import { Dashboard } from "@/components/Dashboard";
import { Insights } from "@/components/Insights";
import { Goals } from "@/components/Goals";
import { QuickActionHub } from "@/components/QuickActionHub";
import { useExpenseContext } from "@/context/ExpenseContext";
import { motion } from "framer-motion";

export default function HomeDashboard() {
  const { expenses, deleteExpense, user } = useExpenseContext();

  return (
    <div className="space-y-8 pb-40 md:pb-32">
      <header className="space-y-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Overview</h1>
          <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest">
            Welcome back, <span className="text-primary-400">{user?.name?.split(" ")[0] || "User"}</span>
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Dashboard expenses={expenses} onDelete={deleteExpense} />
        </div>
        <div className="space-y-8 h-full flex flex-col">
           <Goals />
           <Insights expenses={expenses} />
        </div>
      </div>

      <QuickActionHub />
    </div>
  );
}
