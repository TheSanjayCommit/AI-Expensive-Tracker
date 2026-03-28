"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, TrendingUp, DollarSign, PieChart, Loader2 } from "lucide-react";
import { useExpenseContext } from "@/context/ExpenseContext";

export function AIFinancialAssistant() {
  const { expenses, currencySymbol, user } = useExpenseContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Prepare context for AI
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const weeklyExpenses = expenses.filter(e => new Date(e.date) >= startOfWeek);
    const monthlyExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
    const totalWeekly = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const context = {
        totalWeekly,
        totalMonthly,
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        currency: currencySymbol,
        name: user?.name,
        recentTransactions: expenses.slice(0, 5).map(e => `${e.vendor}: ${currencySymbol}${e.amount} (${e.category})`)
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, context }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const QuickAction = ({ icon: Icon, label, query }: any) => (
    <button 
      onClick={() => { setInput(query); setTimeout(() => handleSendMessage(), 100); }}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-white hover:bg-white/10 hover:border-primary-500/30 transition-all"
    >
      <Icon className="w-3 h-3 text-primary-400" />
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-36 md:bottom-10 left-8 md:left-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            className="absolute bottom-20 left-0 w-[90vw] md:w-[420px] h-[550px] glass-premium rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-primary-500/20 rounded-xl">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#050505] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight leading-tight">Financial Pulse AI</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Connected & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-foreground/20" />
              </button>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-hide">
              {messages.length === 0 && (
                <div className="space-y-6 pt-4">
                  <div className="text-center space-y-2">
                    <p className="text-foreground/40 text-sm font-medium leading-relaxed">How can I help you optimize your wealth today?</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <QuickAction icon={TrendingUp} label="Summary" query="Calculate my weekly and monthly spendings." />
                    <QuickAction icon={DollarSign} label="Save Money" query="How can I save money based on my habits?" />
                    <QuickAction icon={PieChart} label="Analyze Categories" query="What are my top spending categories?" />
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                    m.role === "user" 
                    ? "bg-white text-black rounded-tr-none shadow-xl shadow-white/5" 
                    : "bg-white/5 border border-white/5 text-foreground/80 rounded-tl-none"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 px-5 py-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 bg-slate-950/20">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500 pointer-events-none"></div>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything about your spending..."
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 outline-none transition-all pr-12 placeholder:text-foreground/10"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-white text-black rounded-full shadow-2xl shadow-white/10 flex items-center justify-center group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-7 h-7 relative z-10 group-hover:text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-7 h-7 relative z-10 group-hover:text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-[#050505] group-hover:border-white transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
