import { useState, useRef } from "react";
import { Camera, Loader2, Check, X, RefreshCw, Sparkles, Calendar, Tag, Store, CreditCard } from "lucide-react";
import { Expense } from "@/lib/firebase";
import { useExpenseContext } from "@/context/ExpenseContext";
import { motion, AnimatePresence } from "framer-motion";

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
      // Fallback
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
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-4 py-8 rounded-[2.5rem] glass-premium text-foreground/70 hover:text-white transition-all bg-white/5 border border-white/5 hover:border-primary-500/30 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-4 bg-primary-500 text-white rounded-[1.5rem] shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform relative z-10">
            <Camera className="w-8 h-8" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-lg font-black tracking-tight leading-tight">Capture Receipt</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-foreground/40 mt-1">AI-Powered Extraction</p>
          </div>
        </motion.button>
      </>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-premium rounded-[3rem] p-8 shadow-2xl border border-white/10 space-y-8 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-primary-500/10 rounded-xl">
              <Sparkles className="w-4 h-4 text-primary-400" />
           </div>
           <h3 className="text-lg font-black tracking-tight">AI Vision Scan</h3>
        </div>
        <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-foreground/20" />
        </button>
      </div>

      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-950/80 border border-white/5 shadow-inner">
        {imagePreview && (
          <img src={imagePreview} alt="Receipt" className="w-full h-full object-contain" />
        )}
        
        {step === "preview" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
             <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startScan}
              className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary-500/40 border border-primary-400/50 flex items-center gap-3"
             >
                <RefreshCw className="w-5 h-5" /> Start Analysis
             </motion.button>
          </div>
        )}

        {step === "scanning" && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary-500/10 animate-pulse" />
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary-500 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_25px_rgba(139,92,246,1)] z-20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/60 backdrop-blur-md">
               <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-primary-500" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-400 opacity-50" />
               </div>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-400 animate-pulse">Scanning Data...</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {step === "review" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Parsed Information</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 group">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
                   <Store className="w-3.5 h-3.5" /> Vendor
                </div>
                <input 
                  type="text" 
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 outline-none transition-all"
                  value={formData.vendor}
                  placeholder="Merchant Name"
                  onChange={e => setFormData({...formData, vendor: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
                    <CreditCard className="w-3.5 h-3.5" /> Amount ({currencySymbol})
                  </div>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-lg font-black tracking-tighter focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 outline-none transition-all"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </div>
                  <input 
                    type="date" 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 outline-none transition-all"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 relative group/select">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 pl-1">
                  <Tag className="w-3.5 h-3.5" /> Classification
                </div>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 outline-none appearance-none cursor-pointer transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {["Food", "Transport", "Shopping", "Entertainment", "Groceries", "Utilities", "Health", "Other"].map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 group"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="p-1 bg-black/10 group-hover:bg-white/10 rounded-lg transition-colors"><Check className="w-4 h-4" /></div>}
              Archive Transaction
            </motion.button>
            
            <button 
              onClick={reset}
              className="w-full py-2 text-[10px] text-foreground/20 hover:text-red-500 font-black uppercase tracking-[0.3em] transition-colors"
            >
              Discard Scan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </motion.div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3L6 5L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

