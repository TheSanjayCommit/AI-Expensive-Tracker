"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, getRedirectResult, User } from "firebase/auth";
import { db, getExpenses, addExpense as addExpenseToAPI, deleteExpense as deleteExpenseFromAPI, Expense, CustomUser, saveProfile } from "@/lib/firebase";

interface ExpenseContextType {
  user: CustomUser | null;
  expenses: Expense[];
  isLoading: boolean;
  currency: string;
  currencySymbol: string;
  setCurrency: (c: string) => void;
  register: (profile: Omit<CustomUser, "uid">) => Promise<void>;
  logout: () => void;
  addExpense: (expenseData: Omit<Expense, "id" | "createdAt" | "userId">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
};

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrencyState] = useState("USD");

  const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";

  // Initialize from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("expense_user");
    const savedCurrency = localStorage.getItem("expense_currency");
    
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Sync with primary user preference if exists
        if (parsed.currency) setCurrencyState(parsed.currency);
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
    
    setIsLoading(false);
  }, []);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem("expense_currency", c);
    
    // Update user profile if exists
    if (user) {
      const updatedUser = { ...user, currency: c };
      setUser(updatedUser);
      localStorage.setItem("expense_user", JSON.stringify(updatedUser));
      // Proactively save to Firebase
      saveProfile(updatedUser);
    }
  };

  const register = async (profileData: Omit<CustomUser, "uid">) => {
    setIsLoading(true);
    try {
      const newUser = await saveProfile({ ...profileData, currency });
      setUser(newUser);
      localStorage.setItem("expense_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("expense_user");
    localStorage.removeItem("expense_currency");
    setExpenses([]);
  };

  useEffect(() => {
    const fetchInitialLogs = async () => {
      if (!user?.uid) {
         setExpenses([]);
         return;
      }
      setIsLoading(true);
      try {
        const data = await getExpenses(user.uid);
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching initial expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialLogs();
  }, [user]);

  const addExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "userId">) => {
    if (!user) throw new Error("Must be logged in");
    try {
      const savedExpense = await addExpenseToAPI({ 
        ...expenseData, 
        userId: user.uid,
        currency // Store active currency
      });
      setExpenses(prev => [savedExpense as Expense, ...prev]);
    } catch (error) {
      console.error("Error saving expense:", error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) throw new Error("Must be logged in");
    try {
      await deleteExpenseFromAPI(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error("Error deleting", e);
      throw e;
    }
  };

  return (
    <ExpenseContext.Provider value={{ 
      user, 
      expenses, 
      isLoading, 
      currency, 
      currencySymbol,
      setCurrency,
      register, 
      logout, 
      addExpense, 
      deleteExpense 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
}
