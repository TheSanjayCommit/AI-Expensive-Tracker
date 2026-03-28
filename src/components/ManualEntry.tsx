import { useState } from "react";
import { Plus, X, Check, CreditCard, Calendar, Store, Tag, ChevronRight } from "lucide-react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { motion, AnimatePresence } from "framer-motion";

interface ManualEntryProps {
  onAddExpense: (expense: { amount: number; category: string; vendor: string; date: string; rawText: string }) => Promise<void>;
}

export function ManualEntry({ onAddExpense }: ManualEntryProps) {
  const { currencySymbol } = useExpenseContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "Food",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.vendor) return;

    setIsLoading(true);
    try {
      await onAddExpense({
        amount: Number(formData.amount),
        category: formData.category,
        vendor: formData.vendor,
        date: formData.date,
        rawText: "Manual Entry"
      });
      setIsOpen(false);
      setFormData({ ...formData, amount: "", vendor: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-4 py-8 rounded-[2.5rem] glass-premium text-foreground/70 hover:text-white transition-all bg-white/5 border border-white/5 hover:border-blue-500/30 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-4 bg-blue-500 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform relative z-10">
          <Plus className="w-8 h-8" />
        </div>
        <div className="text-left relative z-10">
          <p className="text-lg font-black tracking-tight leading-tight">Add Manually</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-foreground/40 mt-1">Direct Record Entry</p>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 glass-premium rounded-[3rem] shadow-2xl border border-white/5 relative"
    >
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-6 right-6 p-2 text-foreground/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-3 mb-8">
         <div className="p-2 bg-blue-500/10 rounded-xl">
            <Plus className="w-4 h-4 text-blue-400" />
         </div>
         <h3 className="text-lg font-black tracking-tight">Manual Entry</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
               <CreditCard className="w-3.5 h-3.5" /> Amount ({currencySymbol})
            </div>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-2xl font-black tracking-tighter focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all placeholder:text-foreground/10"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
               <Calendar className="w-3.5 h-3.5" /> Transaction Date
            </div>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
               <Store className="w-3.5 h-3.5" /> Vendor / Merchant
            </div>
            <input 
              type="text" 
              required
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all placeholder:text-foreground/10"
              placeholder="e.g. Starbucks"
            />
          </div>
          <div className="space-y-2 relative group/select">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
               <Tag className="w-3.5 h-3.5" /> Category
            </div>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="Food" className="bg-slate-900 text-white">Food & Dining</option>
                <option value="Transport" className="bg-slate-900 text-white">Transport</option>
                <option value="Shopping" className="bg-slate-900 text-white">Shopping</option>
                <option value="Entertainment" className="bg-slate-900 text-white">Entertainment</option>
                <option value="Groceries" className="bg-slate-900 text-white">Groceries</option>
                <option value="Utilities" className="bg-slate-900 text-white">Utilities</option>
                <option value="Health" className="bg-slate-900 text-white">Health</option>
                <option value="Other" className="bg-slate-900 text-white">Other</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
                <CustomChevron className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={isLoading}
          className="w-full py-5 rounded-[1.5rem] bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 hover:text-white transition-all flex justify-center items-center gap-3 shadow-2xl shadow-white/5 group disabled:opacity-50"
        >
          {isLoading ? <span className="animate-pulse">Archiving...</span> : (
            <>
              <div className="p-1 bg-black/5 group-hover:bg-white/10 rounded-lg transition-colors">
                <Check className="w-4 h-4" />
              </div>
              Archive Transaction
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

function CustomChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3L6 5L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

