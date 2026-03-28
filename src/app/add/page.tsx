"use client";

import { useState } from "react";
import { VoiceInput } from "@/components/VoiceInput";
import { ManualEntry } from "@/components/ManualEntry";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { useExpenseContext } from "@/context/ExpenseContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Scan, PenLine } from "lucide-react";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-32 pt-8"
    >
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">AI Powered Entry</span>
        </motion.div>
        <h1 className="text-5xl font-black tracking-tight text-white leading-tight">Log Transaction</h1>
        <p className="text-foreground/40 text-lg font-medium max-w-lg mx-auto leading-relaxed">Choose your preferred recording method to synchronize your records.</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {/* Primary Action: Voice */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-blue-600 rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
          <VoiceInput onTranscriptComplete={handleTranscript} isProcessing={isProcessingVoice} />
        </div>
        
        <div className="flex items-center gap-8 py-4 px-12">
          <div className="h-px bg-white/5 flex-1"></div>
          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Alternate Methods</span>
          <div className="h-px bg-white/5 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-20">
          {/* Scan Section */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 pl-2">
               <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Scan className="w-4 h-4 text-emerald-400" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40">Visual Scan</h3>
            </div>
            <ReceiptScanner onAddExpense={handleAddManualOrReceipt} />
          </motion.div>

          {/* Manual Section */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 pl-2 text-blue-400">
               <div className="p-2 bg-blue-500/10 rounded-xl">
                  <PenLine className="w-4 h-4 text-blue-400" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40">Manual Entry</h3>
            </div>
            <ManualEntry onAddExpense={handleAddManualOrReceipt} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

