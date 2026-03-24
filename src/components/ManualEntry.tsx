import { useState } from "react";
import { Plus, X } from "lucide-react";

interface ManualEntryProps {
  onAddExpense: (expense: { amount: number; category: string; vendor: string; date: string; rawText: string }) => Promise<void>;
}

export function ManualEntry({ onAddExpense }: ManualEntryProps) {
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
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl glass-panel text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Add Manually
      </button>
    );
  }

  return (
    <div className="mt-4 p-6 glass-panel rounded-3xl animate-in fade-in slide-in-from-top-4 relative">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <h3 className="text-lg font-bold mb-4">Manual Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-foreground/70 ml-1">Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-mono"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/70 ml-1">Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-foreground/70 ml-1">Vendor/Title</label>
            <input 
              type="text" 
              required
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              placeholder="e.g. Uber"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/70 ml-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none"
            >
              <option value="Food">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Groceries">Groceries</option>
              <option value="Utilities">Utilities</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </div>
  );
}
