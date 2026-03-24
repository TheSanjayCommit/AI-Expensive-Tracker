"use client";

import { useExpenseContext } from "@/context/ExpenseContext";
import { logout } from "@/lib/firebase";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user } = useExpenseContext();
  const [budget, setBudget] = useState("1000");

  useEffect(() => {
    const saved = localStorage.getItem("expense_budget");
    if (saved) setBudget(saved);
  }, []);

  const handleSaveBudget = () => {
    localStorage.setItem("expense_budget", budget);
    alert("Budget updated successfully! Changes will reflect on the dashboard.");
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-foreground/50 text-sm">Manage your account and app preferences.</p>
      </header>

      <div className="glass dark:glass-dark rounded-3xl p-8 shadow-lg space-y-8 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white/10 shadow-xl overflow-hidden bg-primary-500/20 flex items-center justify-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-primary-500" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{user.displayName}</h2>
            <p className="text-foreground/60">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-500 text-xs font-semibold rounded-full border border-green-500/20">Active Account</span>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h3 className="text-lg font-semibold">Monthly Budget Goal</h3>
          <p className="text-sm text-foreground/50">Set a target budget to track on your dashboard progress bar.</p>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 font-medium">$</span>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
              />
            </div>
            <button 
              onClick={handleSaveBudget}
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
            >
              Save
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 relative z-10" />

        <div className="relative z-10 pt-2">
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 px-6 py-3 rounded-xl transition-all font-semibold border border-red-500/20"
          >
            <LogOut className="w-5 h-5" /> Sign Out from App
          </button>
        </div>
      </div>
    </div>
  );
}
