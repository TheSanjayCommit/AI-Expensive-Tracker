"use client";

import { useState } from "react";
import { VoiceInput } from "@/components/VoiceInput";
import { ManualEntry } from "@/components/ManualEntry";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { useExpenseContext } from "@/context/ExpenseContext";
import { useRouter } from "next/navigation";

export default function AddExpensePage() {
  const { addExpense } = useExpenseContext();
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const router = useRouter();

  const handleTranscript = async (transcript: string) => {
    setIsProcessingVoice(true);
    try {
      const res = await fetch("/api/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!res.ok) throw new Error("Failed connecting to AI API");
      
      const parsedData = await res.json();
      
      if (parsedData && parsedData.amount) {
         await addExpense({
           amount: Number(parsedData.amount),
           category: parsedData.category || "Uncategorized",
           vendor: parsedData.vendor || "Unknown",
           date: parsedData.date || new Date().toISOString().split('T')[0],
           rawText: transcript
         });
         router.push("/"); // Redirect to dashboard on success
      } else {
        alert("Couldn't understand the expense completely. Please try again.");
      }
    } catch (error: any) {
      console.error("Pipeline error:", error);
      alert("Error: " + (error.message || "An error occurred while processing your expense."));
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleAddManualOrReceipt = async (expenseData: any) => {
    try {
      await addExpense(expenseData);
      router.push("/");
    } catch (error: any) {
      alert("Error saving expense: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pt-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
        <p className="text-foreground/50 text-sm">Choose how you want to log your transaction.</p>
      </header>

      <section className="space-y-6 relative z-20">
        <VoiceInput onTranscriptComplete={handleTranscript} isProcessing={isProcessingVoice} />
        
        <div className="flex items-center gap-4 py-4 opacity-50">
          <div className="h-px bg-white/20 flex-1"></div>
          <span className="text-xs font-semibold uppercase tracking-wider">OR</span>
          <div className="h-px bg-white/20 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground/80 pl-1">Scan physical receipt</h3>
            <ReceiptScanner onAddExpense={handleAddManualOrReceipt} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground/80 pl-1">Type it out manually</h3>
            <ManualEntry onAddExpense={handleAddManualOrReceipt} />
          </div>
        </div>
      </section>
    </div>
  );
}
