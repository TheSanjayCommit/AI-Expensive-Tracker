"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, getRedirectResult, User } from "firebase/auth";
import { auth, getExpenses, addExpense as addExpenseToAPI, deleteExpense as deleteExpenseFromAPI, Expense } from "@/lib/firebase";

interface ExpenseContextType {
  user: User | null;
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (expenseData: Omit<Expense, "id" | "createdAt" | "userId">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Handle the user landing back on the app after signInWithRedirect
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect sign-in error:", error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInitialLogs = async () => {
      if (!user) {
         setExpenses([]);
         setIsLoading(false);
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

    if (!isAuthChecking) {
       fetchInitialLogs();
    }
  }, [user, isAuthChecking]);

  const addExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "userId">) => {
    if (!user) throw new Error("Must be logged in");
    try {
      const savedExpense = await addExpenseToAPI({ ...expenseData, userId: user.uid });
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
    <ExpenseContext.Provider value={{ user, expenses, isLoading: isAuthChecking ? true : isLoading, addExpense, deleteExpense }}>
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
