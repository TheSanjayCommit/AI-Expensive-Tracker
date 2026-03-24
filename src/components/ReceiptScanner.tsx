import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Expense } from "@/lib/firebase";

interface ReceiptScannerProps {
  onAddExpense: (expense: Omit<Expense, "id" | "createdAt" | "userId">) => Promise<void>;
}

export function ReceiptScanner({ onAddExpense }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const res = await fetch("/api/parse-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            imageBase64: base64,
            mimeType: file.type
          }),
        });

        if (!res.ok) throw new Error("Failed to parse receipt");
        const parsedData = await res.json();
        
        if (parsedData && parsedData.amount) {
          await onAddExpense({
            amount: Number(parsedData.amount),
            category: parsedData.category || "Uncategorized",
            vendor: parsedData.vendor || "Receipt Upload",
            date: parsedData.date || new Date().toISOString().split('T')[0],
            rawText: "Receipt Upload"
          });
          alert("Receipt successfully scanned and logged!");
        } else {
          alert("Couldn't read receipt details. Please try again or enter manually.");
        }
        setIsScanning(false);
      };
      
      reader.onerror = () => {
        alert("Error reading file image.");
        setIsScanning(false);
      };
    } catch (err) {
      console.error(err);
      alert("Error processing receipt.");
      setIsScanning(false);
    }
    
    // reset input so the same file could be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        disabled={isScanning}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl glass-panel text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
      >
        {isScanning ? <Loader2 className="w-5 h-5 animate-spin text-primary-500" /> : <Camera className="w-5 h-5" />} 
        {isScanning ? "Scanning Receipt..." : "Scan Receipt"}
      </button>
    </>
  );
}
