import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { Expense } from "@/lib/firebase";
import { useExpenseContext } from "@/context/ExpenseContext";

interface ReceiptScannerProps {
  onAddExpense: (expense: Omit<Expense, "id" | "createdAt" | "userId">) => Promise<void>;
}

export function ReceiptScanner({ onAddExpense }: ReceiptScannerProps) {
  const { currencySymbol } = useExpenseContext();
  const [step, setStep] = useState<"idle" | "preview" | "scanning" | "review">("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    amount: 0,
    category: "Other",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
  });

  const compressImage = (file: File): Promise<{ base64: string; type: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve({ base64, type: "image/jpeg" });
      };
      img.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("scanning"); // Show loading during compression
    try {
      const { base64, type } = await compressImage(file);
      setImagePreview(base64);
      setMimeType(type);
      setStep("preview");
    } catch (err) {
      console.error("Compression error:", err);
      // Fallback to raw if compression fails
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setMimeType(file.type);
        setStep("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!imagePreview) return;
    setStep("scanning");
    
    try {
      const res = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64: imagePreview,
          mimeType: mimeType
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse receipt");
      
      setFormData({
        amount: Number(data.amount) || 0,
        category: data.category || "Other",
        vendor: data.vendor || "",
        date: data.date || new Date().toISOString().split("T")[0],
      });
      setStep("review");
    } catch (err: any) {
      console.error(err);
      alert(`AI Scan Error: ${err.message}. You can still enter details manually.`);
      setStep("review");
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onAddExpense({
        ...formData,
        rawText: `Receipt Scan: ${formData.vendor}`
      });
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to save expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep("idle");
    setImagePreview(null);
    setFormData({
      amount: 0,
      category: "Other",
      vendor: "",
      date: new Date().toISOString().split("T")[0],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (step === "idle") {
    return (
      <>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl glass-panel text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all text-sm font-semibold border border-white/5 hover:border-primary-500/30 group"
        >
          <div className="p-2 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors">
            <Camera className="w-5 h-5 text-primary-500" />
          </div>
          Scan Physical Receipt
        </button>
      </>
    );
  }

  return (
    <div className="glass dark:glass-dark rounded-3xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Receipt Scan</h3>
        <button onClick={reset} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5 text-foreground/40" />
        </button>
      </div>

      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border border-white/5">
        {imagePreview && (
          <img src={imagePreview} alt="Receipt" className="w-full h-full object-cover" />
        )}
        
        {step === "preview" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
             <button 
              onClick={startScan}
              className="bg-primary-500 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-primary-500/40 hover:scale-105 transition-transform flex items-center gap-2"
             >
                <RefreshCw className="w-5 h-5" /> Start AI Scan
             </button>
          </div>
        )}

        {step === "scanning" && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary-500/10 animate-pulse" />
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-500 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
               <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
               <p className="text-sm font-bold uppercase tracking-widest text-primary-400">AI Analyzing...</p>
            </div>
          </div>
        )}
      </div>

      {step === "review" && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-primary-500 mb-2">
            <Check className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Review AI Results</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Vendor/Store</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
                value={formData.vendor}
                onChange={e => setFormData({...formData, vendor: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Amount ({currencySymbol})</label>
                <input 
                  type="number" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5 relative group/select">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Category</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none appearance-none cursor-pointer group-hover/select:border-white/20 transition-all"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {["Food", "Transport", "Shopping", "Entertainment", "Groceries", "Utilities", "Health", "Other"].map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Confirm & Save Expense
          </button>
          
          <button 
            onClick={reset}
            className="w-full py-3 text-sm text-foreground/40 hover:text-foreground/70 font-medium transition-colors"
          >
            Discard Scan
          </button>
        </div>
      )}
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
